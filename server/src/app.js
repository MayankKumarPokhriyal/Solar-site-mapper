import express from "express";
import cors from "cors";
import geocodeRoutes from "./routes/geocode.routes.js";
import solarRoutes from "./routes/solar.routes.js";
import pvwattsRoutes from "./routes/pvwatts.routes.js";

/**
 * Express application setup: middleware first, then API routes, then a catch-all error handler.
 */
export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    }),
  );
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/geocode", geocodeRoutes);
  app.use("/api/solar", solarRoutes);
  app.use("/api/pvwatts", pvwattsRoutes);

  // Last-resort safety net so unexpected errors still return JSON instead of crashing the process.
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Unexpected server error",
    });
  });

  return app;
}
