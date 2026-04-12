import { useNavigate } from "react-router-dom";

function statusBadge(status) {
  if (status === "valid") return <span className="badge valid">valid</span>;
  if (status === "invalid") return <span className="badge invalid">invalid</span>;
  return <span className="badge pending">pending</span>;
}

/**
 * Shows every site the user attempted to add so they can revisit successes and failures.
 */
export default function SiteList({ sites }) {
  const navigate = useNavigate();

  if (!sites.length) {
    return (
      <div className="card">
        <p className="muted" style={{ margin: 0 }}>
          No sites yet. Add an address above to place your first marker.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Sites</h3>
      <ul className="site-list">
        {sites.map((site) => (
          <li
            key={site.id}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/site/${site.id}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate(`/site/${site.id}`);
            }}
          >
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <div>{site.address}</div>
                {site.status === "invalid" ? (
                  <div className="error" style={{ marginTop: "0.25rem" }}>
                    {site.error || "Address not found"}
                  </div>
                ) : null}
              </div>
              {statusBadge(site.status)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
