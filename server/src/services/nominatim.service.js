import axios from "axios";

/**
 * Calls OpenStreetMap Nominatim to turn a free-text address into coordinates.
 * Nominatim requires a descriptive User-Agent identifying your app (fair-use policy).
 */
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/** Thrown when Nominatim returns HTTP 429 (fair-use rate limit). */
export class GeocodeRateLimitError extends Error {
  constructor() {
    super("GeocodeRateLimit");
    this.name = "GeocodeRateLimitError";
  }
}

export async function geocodeAddress(address) {
  const response = await axios.get(NOMINATIM_URL, {
    params: {
      q: address,
      format: "json",
      limit: 1,
    },
    headers: {
      // Required by Nominatim: identify this project so operators can contact us if needed.
      "User-Agent": "SolarSiteMapper/1.0 (local educational project; contact via repo maintainer)",
    },
    timeout: 15000,
    validateStatus: () => true,
  });

  if (response.status === 429) {
    throw new GeocodeRateLimitError();
  }

  if (response.status >= 400) {
    throw new Error(`Geocoding service returned status ${response.status}`);
  }

  const results = Array.isArray(response.data) ? response.data : [];
  const first = results[0];

  if (!first || first.lat === undefined || first.lon === undefined) {
    return null;
  }

  return {
    lat: Number(first.lat),
    lon: Number(first.lon),
    displayName: String(first.display_name ?? address),
  };
}
