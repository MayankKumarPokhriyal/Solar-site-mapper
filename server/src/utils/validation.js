/**
 * Input helpers for API query parameters.
 * We validate before calling external APIs so we fail fast with clear JSON errors.
 */

/**
 * Trims the address and rejects empty strings so we never spam Nominatim with blank queries.
 */
export function parseAddress(raw) {
  if (raw === undefined || raw === null) {
    return { ok: false, error: "Address is required" };
  }
  const trimmed = String(raw).trim();
  if (!trimmed) {
    return { ok: false, error: "Address is required" };
  }
  return { ok: true, value: trimmed };
}

/**
 * Parses latitude and longitude from query strings and checks numeric ranges.
 * Invalid coordinates would produce confusing errors from NREL, so we catch them here.
 */
export function parseLatLon(latRaw, lonRaw) {
  if (latRaw === undefined || latRaw === null || lonRaw === undefined || lonRaw === null) {
    return { ok: false, error: "Latitude and longitude are required" };
  }

  const lat = Number(latRaw);
  const lon = Number(lonRaw);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return { ok: false, error: "Latitude and longitude must be valid numbers" };
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return { ok: false, error: "Latitude or longitude is out of range" };
  }

  return { ok: true, lat, lon };
}
