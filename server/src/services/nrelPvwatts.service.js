import axios from "axios";
import {
  nrelHttpErrorMessage,
  roundCoord,
  sleepMs,
  withNrelCache,
} from "../utils/nrelCache.js";

// NREL docs: base URL may move to developer.nlr.gov; update this constant when required.
const NREL_BASE = "https://developer.nrel.gov";

const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 200;

// Fingerprint for demo PVWatts params (must match params below).
const PVWATTS_PARAMS_KEY = "v8_sc4_m0_l14_a1_az180_nsrdb";

function pvwattsParams(apiKey, lat, lon) {
  return {
    api_key: apiKey,
    lat,
    lon,
    system_capacity: 4,
    module_type: 0,
    losses: 14,
    array_type: 1,
    azimuth: 180,
    tilt: Math.min(Math.max(Math.abs(lat), 0), 60),
    dataset: "nsrdb",
  };
}

async function getPvwattsOnce(apiKey, lat, lon) {
  const url = `${NREL_BASE}/api/pvwatts/v8.json`;
  return axios.get(url, {
    params: pvwattsParams(apiKey, lat, lon),
    timeout: 30000,
    validateStatus: () => true,
  });
}

async function fetchPvwattsEstimateUncached(apiKey, lat, lon) {
  let response = await getPvwattsOnce(apiKey, lat, lon);

  if (response.status === 429) {
    await sleepMs(1500 + Math.random() * 500);
    response = await getPvwattsOnce(apiKey, lat, lon);
  }

  if (response.status >= 400) {
    throw new Error(nrelHttpErrorMessage("PVWatts", response.status));
  }

  const body = response.data;
  const apiErrors = body?.errors;
  if (Array.isArray(apiErrors) && apiErrors.length > 0) {
    throw new Error(apiErrors.join("; "));
  }

  const outputs = body?.outputs ?? {};

  return {
    acAnnual: outputs.ac_annual ?? null,
    capacityFactor: outputs.capacity_factor ?? null,
    solradAnnual: outputs.solrad_annual ?? null,
  };
}

/**
 * Runs a simple PVWatts v8 estimate for the given coordinates.
 * We use conservative demo defaults (fixed system size, standard losses) so the assessment focuses on location, not system design.
 */
export async function fetchPvwattsEstimate(apiKey, lat, lon) {
  const key = `pvwatts:${PVWATTS_PARAMS_KEY}:${roundCoord(lat)}:${roundCoord(lon)}`;
  return withNrelCache(key, CACHE_TTL_MS, CACHE_MAX_ENTRIES, () =>
    fetchPvwattsEstimateUncached(apiKey, lat, lon),
  );
}
