import axios from "axios";
import { parseAddress } from "../utils/validation.js";
import {
  GeocodeRateLimitError,
  geocodeAddress,
} from "../services/nominatim.service.js";

/**
 * GET /api/geocode?address=...
 * Converts a street address to coordinates using Nominatim.
 *
 * Error semantics:
 * - Validation: missing/blank address → use parseAddress error (e.g. "Address is required").
 * - Not found: input passed validation but Nominatim returned no usable hit → "Address not found".
 * - Transport: timeout or no HTTP response → "Geocoding service unavailable".
 * - Rate limit: Nominatim HTTP 429 → "Geocoding rate limit exceeded".
 * - Other unexpected errors → generic "Geocoding failed" (not confused with "no results").
 */
export async function getGeocode(req, res) {
  try {
    const parsed = parseAddress(req.query.address);
    if (!parsed.ok) {
      return res.json({ success: false, error: parsed.error });
    }

    const result = await geocodeAddress(parsed.value);

    if (!result) {
      return res.json({ success: false, error: "Address not found" });
    }

    return res.json({
      success: true,
      data: {
        lat: result.lat,
        lon: result.lon,
        displayName: result.displayName,
      },
    });
  } catch (err) {
    if (err instanceof GeocodeRateLimitError) {
      return res.json({
        success: false,
        error: "Geocoding rate limit exceeded",
      });
    }
    if (
      axios.isAxiosError(err) &&
      (err.code === "ECONNABORTED" || err.response == null)
    ) {
      return res.json({
        success: false,
        error: "Geocoding service unavailable",
      });
    }
    return res.json({ success: false, error: "Geocoding failed" });
  }
}
