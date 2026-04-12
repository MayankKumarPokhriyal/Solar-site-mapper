import axios from "axios";

/**
 * Central place for backend URLs so components stay focused on UI, not wiring.
 * VITE_API_URL lets you point at a different host without editing multiple files.
 */
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 40000,
});

/**
 * Sends the user-entered address to the backend for geocoding.
 */
export async function geocodeAddress(address) {
  const { data } = await client.get("/api/geocode", {
    params: { address },
  });
  return data;
}

/**
 * Loads annual solar resource summaries for coordinates returned from geocoding.
 * Pass `signal` to cancel in-flight requests (e.g. React Strict Mode remount).
 */
export async function fetchSolar(lat, lon, options = {}) {
  const { signal } = options;
  const { data } = await client.get("/api/solar", {
    params: { lat, lon },
    signal,
  });
  return data;
}

/**
 * Loads PVWatts summary numbers for the same coordinates.
 * Pass `signal` to cancel in-flight requests (e.g. React Strict Mode remount).
 */
export async function fetchPvwatts(lat, lon, options = {}) {
  const { signal } = options;
  const { data } = await client.get("/api/pvwatts", {
    params: { lat, lon },
    signal,
  });
  return data;
}
