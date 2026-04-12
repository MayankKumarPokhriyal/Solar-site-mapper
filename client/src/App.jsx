import { Routes, Route, Navigate } from "react-router-dom";
import { SitesProvider } from "./context/SitesContext.jsx";
import MapPage from "./pages/MapPage.jsx";
import SiteDetailPage from "./pages/SiteDetailPage.jsx";

/**
 * Top-level routing: map at "/", detail at "/site/:id".
 * SitesProvider wraps both routes so list + detail share the same in-memory site list.
 */
export default function App() {
  return (
    <SitesProvider>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/site/:id" element={<SiteDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SitesProvider>
  );
}
