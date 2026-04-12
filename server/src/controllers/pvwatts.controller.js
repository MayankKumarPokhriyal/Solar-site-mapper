import { parseLatLon } from "../utils/validation.js";
import { fetchPvwattsEstimate } from "../services/nrelPvwatts.service.js";

/**
 * GET /api/pvwatts?lat=&lon=
 * Returns summary PVWatts v8 outputs for the given coordinates.
 */
export async function getPvwatts(req, res) {
  try {
    const parsed = parseLatLon(req.query.lat, req.query.lon);
    if (!parsed.ok) {
      return res.json({ success: false, error: parsed.error });
    }

    const apiKey = process.env.NREL_API_KEY;
    if (!apiKey || apiKey === "your_key_here") {
      return res.json({
        success: false,
        error: "Server is missing a valid NREL_API_KEY in .env",
      });
    }

    const data = await fetchPvwattsEstimate(apiKey, parsed.lat, parsed.lon);
    return res.json({ success: true, data });
  } catch (err) {
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Failed to load PVWatts data";
    return res.json({ success: false, error: message });
  }
}
