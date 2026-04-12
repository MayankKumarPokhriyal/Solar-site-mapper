import { useState } from "react";
import { useSites } from "../context/SitesContext.jsx";
import AddSiteForm from "../components/AddSiteForm.jsx";
import SiteMap from "../components/SiteMap.jsx";
import SiteList from "../components/SiteList.jsx";

/**
 * Landing page: collect addresses, show the U.S. map, and list every attempted site.
 */
export default function MapPage() {
  const { sites, addSite, addSiteMessage, clearAddSiteMessage } = useSites();
  const [adding, setAdding] = useState(false);

  async function handleAdd(address) {
    setAdding(true);
    try {
      return await addSite(address);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="app-shell">
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ margin: "0 0 0.25rem" }}>Solar Site Mapper</h1>
        <p className="muted" style={{ margin: 0 }}>
          Add U.S. addresses to geocode them, map valid coordinates, and inspect solar resource data per site.
        </p>
      </header>

      <AddSiteForm
        onAdd={handleAdd}
        busy={adding}
        blockedMessage={addSiteMessage}
        onDismissBlockedMessage={clearAddSiteMessage}
      />

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Map</h3>
        <SiteMap sites={sites} />
      </div>

      <SiteList sites={sites} />

      <p className="muted">
        Tip: open a site&apos;s detail page from the list or by clicking a marker.
      </p>
    </div>
  );
}
