import axios from "axios";
import {
  nrelHttpErrorMessage,
  roundCoord,
  sleepMs,
  withNrelCache,
} from "../utils/nrelCache.js";

/**
 * Base URL for NREL APIs. Docs mention a future host change; keeping one constant makes updates easy.
 */
const NREL_BASE = "https://developer.nrel.gov";

const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 200;

async function getSolarResourceOnce(apiKey, lat, lon) {
  const url = `${NREL_BASE}/api/solar/solar_resource/v1.json`;
  return axios.get(url, {
    params: {
      api_key: apiKey,
      lat,
      lon,
    },
    timeout: 20000,
    validateStatus: () => true,
  });
}

async function fetchSolarResourceUncached(apiKey, lat, lon) {
  let response = await getSolarResourceOnce(apiKey, lat, lon);

  if (response.status === 429) {
    await sleepMs(1500 + Math.random() * 500);
    response = await getSolarResourceOnce(apiKey, lat, lon);
  }

  if (response.status >= 400) {
    throw new Error(nrelHttpErrorMessage("Solar", response.status));
  }

  const body = response.data;
  const apiErrors = body?.errors;
  if (Array.isArray(apiErrors) && apiErrors.length > 0) {
    throw new Error(apiErrors.join("; "));
  }

  const outputs = body?.outputs ?? {};
  const avgDni = outputs?.avg_dni?.annual;
  const avgGhi = outputs?.avg_ghi?.annual;
  const avgLatTilt = outputs?.avg_lat_tilt?.annual;

  return {
    avgDni: avgDni ?? null,
    avgGhi: avgGhi ?? null,
    avgLatTilt: avgLatTilt ?? null,
  };
}

/**
 * Fetches annual solar resource summaries (DNI, GHI, tilt) for a lat/lon using NREL Solar Resource Data v1.
 */
export async function fetchSolarResource(apiKey, lat, lon) {
  const key = `solar:sr_v1:${roundCoord(lat)}:${roundCoord(lon)}`;
  return withNrelCache(key, CACHE_TTL_MS, CACHE_MAX_ENTRIES, () =>
    fetchSolarResourceUncached(apiKey, lat, lon),
  );
}
