import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { geocodeAddress } from "../services/api.js";

/**
 * Key used in localStorage so refreshing the page does not wipe the working site list during demos.
 * We stringify JSON because localStorage only stores strings.
 */
const STORAGE_KEY = "solar-site-mapper-sites";

const SitesContext = createContext(null);

/**
 * Normalizes free-text addresses for duplicate detection only (trim + lowercase).
 * Display text on each site row stays as the user typed it (after trim).
 */
function normalizeAddressKey(str) {
  return String(str ?? "").trim().toLowerCase();
}

function loadSitesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // If someone hand-edits storage, fail soft and start fresh instead of crashing the app.
    return [];
  }
}

/**
 * Provider that owns the list of sites and the "add site" workflow (geocode + status updates).
 */
export function SitesProvider({ children }) {
  const [sites, setSites] = useState(() => loadSitesFromStorage());
  /** Shown near the add form when the user tries to add a duplicate (not persisted on a site row). */
  const [addSiteMessage, setAddSiteMessage] = useState(null);

  // Whenever sites change, mirror them to localStorage for durability across reloads.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
    } catch {
      // Private mode / quota issues: ignore persistence but keep the UI working in memory.
    }
  }, [sites]);

  const clearAddSiteMessage = useCallback(() => {
    setAddSiteMessage(null);
  }, []);

  /**
   * Adds a new site row, marks it pending, then asks the backend to geocode the address.
   * Invalid addresses remain in the list with status "invalid" so you can explain what went wrong.
   * Duplicate addresses (same normalized key) are rejected without a new row or API call.
   *
   * Duplicate detection uses a functional `setSites` updater so it always sees the latest list,
   * avoiding stale closures when multiple submissions run before React re-renders.
   */
  const addSite = useCallback(async (rawAddress) => {
    const address = String(rawAddress ?? "").trim();
    // Fresh attempt: clear any prior duplicate warning from the form.
    setAddSiteMessage(null);

    if (!address) return false;

    const key = normalizeAddressKey(address);

    let newId = null;
    let rejectedDuplicate = false;

    setSites((prev) => {
      if (prev.some((s) => normalizeAddressKey(s.address) === key)) {
        rejectedDuplicate = true;
        return prev;
      }
      newId = crypto.randomUUID();
      return [
        ...prev,
        {
          id: newId,
          address,
          lat: null,
          lon: null,
          status: "pending",
          error: null,
        },
      ];
    });

    if (rejectedDuplicate) {
      setAddSiteMessage("Address already added");
      return false;
    }

    const id = newId;

    try {
      const result = await geocodeAddress(address);
      if (result?.success && result.data) {
        setSites((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  status: "valid",
                  lat: result.data.lat,
                  lon: result.data.lon,
                  error: null,
                }
              : s,
          ),
        );
      } else {
        const message = result?.error || "Address not found";
        setSites((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  status: "invalid",
                  lat: null,
                  lon: null,
                  error: message,
                }
              : s,
          ),
        );
      }
    } catch {
      setSites((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: "invalid",
                lat: null,
                lon: null,
                error: "Could not reach the geocoding service. Is the API running?",
              }
            : s,
        ),
      );
    }

    return true;
  }, []);

  const value = useMemo(
    () => ({
      sites,
      addSite,
      addSiteMessage,
      clearAddSiteMessage,
    }),
    [sites, addSite, addSiteMessage, clearAddSiteMessage],
  );

  return (
    <SitesContext.Provider value={value}>{children}</SitesContext.Provider>
  );
}

export function useSites() {
  const ctx = useContext(SitesContext);
  if (!ctx) {
    throw new Error("useSites must be used within SitesProvider");
  }
  return ctx;
}
