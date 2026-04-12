import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSites } from "../context/SitesContext.jsx";
import { fetchPvwatts, fetchSolar } from "../services/api.js";

function isRequestAborted(err) {
  return (
    axios.isCancel?.(err) ||
    err?.code === "ERR_CANCELED" ||
    err?.name === "CanceledError"
  );
}

/**
 * Detail view for a single site: coordinates plus NREL solar + PVWatts summaries.
 */
export default function SiteDetailPage() {
  const { id } = useParams();
  const { sites } = useSites();

  const site = useMemo(() => sites.find((s) => s.id === id), [sites, id]);

  const [solarState, setSolarState] = useState({
    loading: false,
    error: null,
    data: null,
  });
  const [pvState, setPvState] = useState({
    loading: false,
    error: null,
    data: null,
  });

  useEffect(() => {
    if (!site || site.status !== "valid" || site.lat == null || site.lon == null) {
      return;
    }

    const ac = new AbortController();
    const { signal } = ac;

    async function loadSolar() {
      setSolarState({ loading: true, error: null, data: null });
      try {
        const res = await fetchSolar(site.lat, site.lon, { signal });
        if (res.success) {
          setSolarState({ loading: false, error: null, data: res.data });
        } else {
          setSolarState({
            loading: false,
            error: res.error || "Failed to load solar data",
            data: null,
          });
        }
      } catch (err) {
        if (isRequestAborted(err)) return;
        setSolarState({
          loading: false,
          error: "Failed to load solar data",
          data: null,
        });
      }
    }

    async function loadPv() {
      setPvState({ loading: true, error: null, data: null });
      try {
        const res = await fetchPvwatts(site.lat, site.lon, { signal });
        if (res.success) {
          setPvState({ loading: false, error: null, data: res.data });
        } else {
          setPvState({
            loading: false,
            error: res.error || "Failed to load PVWatts data",
            data: null,
          });
        }
      } catch (err) {
        if (isRequestAborted(err)) return;
        setPvState({
          loading: false,
          error: "Failed to load PVWatts data",
          data: null,
        });
      }
    }

    loadSolar();
    loadPv();

    return () => {
      ac.abort();
    };
  }, [site]);

  if (!site) {
    return (
      <div className="app-shell">
        <div className="card">
          <h2>Site not found</h2>
          <p className="muted">
            That id is not in your saved list. Add the address again from the map page.
          </p>
          <Link to="/">Back to map</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <p>
        <Link to="/">← Back to map</Link>
      </p>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Site details</h2>
        <p>
          <strong>Address:</strong> {site.address}
        </p>
        <p>
          <strong>Status:</strong> {site.status}
        </p>
        {site.status === "valid" ? (
          <p>
            <strong>Coordinates:</strong> {site.lat?.toFixed(5)}, {site.lon?.toFixed(5)}
          </p>
        ) : null}
        {site.status === "pending" ? (
          <p className="muted">Still resolving this address… return to the map in a moment.</p>
        ) : null}
        {site.status === "invalid" ? (
          <p className="error">{site.error || "Address not found"}</p>
        ) : null}
      </div>

      {site.status === "valid" ? (
        <>
          <div className="card success-panel">
            <h3>Solar resource (NREL)</h3>
            {solarState.loading ? <p className="muted">Loading solar data…</p> : null}
            {solarState.error ? <p className="error">{solarState.error}</p> : null}
            {solarState.data ? (
              <div className="grid-2">
                <div className="stat">
                  <span className="muted">Average DNI (annual)</span>
                  <strong>
                    {solarState.data.avgDni != null
                      ? `${solarState.data.avgDni} kWh/m²/day`
                      : "—"}
                  </strong>
                </div>
                <div className="stat">
                  <span className="muted">Average GHI (annual)</span>
                  <strong>
                    {solarState.data.avgGhi != null
                      ? `${solarState.data.avgGhi} kWh/m²/day`
                      : "—"}
                  </strong>
                </div>
                <div className="stat">
                  <span className="muted">Average latitude tilt (annual)</span>
                  <strong>
                    {solarState.data.avgLatTilt != null
                      ? `${solarState.data.avgLatTilt} kWh/m²/day`
                      : "—"}
                  </strong>
                </div>
              </div>
            ) : null}
            {!solarState.loading && !solarState.error && !solarState.data ? (
              <p className="muted">No solar data returned.</p>
            ) : null}
          </div>

          <div className="card success-panel">
            <h3>PVWatts estimate (NREL)</h3>
            {pvState.loading ? <p className="muted">Loading PVWatts…</p> : null}
            {pvState.error ? <p className="error">{pvState.error}</p> : null}
            {pvState.data ? (
              <div className="grid-2">
                <div className="stat">
                  <span className="muted">Annual AC energy</span>
                  <strong>
                    {pvState.data.acAnnual != null
                      ? `${Math.round(pvState.data.acAnnual)} kWh`
                      : "—"}
                  </strong>
                </div>
                <div className="stat">
                  <span className="muted">Capacity factor</span>
                  <strong>
                    {pvState.data.capacityFactor != null
                      ? (() => {
                          const cf = Number(pvState.data.capacityFactor);
                          // NREL sometimes returns a 0–1 fraction and sometimes a 0–100 percent; handle both.
                          const pct = cf <= 1 ? cf * 100 : cf;
                          return `${pct.toFixed(1)}%`;
                        })()
                      : "—"}
                  </strong>
                </div>
                <div className="stat">
                  <span className="muted">Annual solar radiation</span>
                  <strong>
                    {pvState.data.solradAnnual != null
                      ? `${pvState.data.solradAnnual} kWh/m²/day`
                      : "—"}
                  </strong>
                </div>
              </div>
            ) : null}
            {!pvState.loading && !pvState.error && !pvState.data ? (
              <p className="muted">No PVWatts data returned.</p>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
