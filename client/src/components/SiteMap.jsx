import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/**
 * Vite does not bundle Leaflet's default marker assets the way older bundlers did.
 * We point Leaflet at the imported image URLs so markers render instead of broken images.
 */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const US_CENTER = [39.8283, -98.5795];
const DEFAULT_ZOOM = 4;

/**
 * Renders the basemap and one marker per valid site. Invalid sites have no coordinates, so they never appear here.
 */
export default function SiteMap({ sites }) {
  const navigate = useNavigate();
  const validSites = sites.filter((s) => s.status === "valid" && s.lat != null && s.lon != null);

  return (
    <div className="map-wrap">
      <MapContainer
        center={US_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validSites.map((site) => (
          <Marker
            key={site.id}
            position={[site.lat, site.lon]}
            eventHandlers={{
              click: () => navigate(`/site/${site.id}`),
            }}
          >
            <Popup>
              <div>
                <strong>{site.address}</strong>
                <div className="muted">Click the marker to open details.</div>
                <button
                  type="button"
                  className="btn"
                  style={{ marginTop: "0.5rem" }}
                  onClick={() => navigate(`/site/${site.id}`)}
                >
                  View details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
