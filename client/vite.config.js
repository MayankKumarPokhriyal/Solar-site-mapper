import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite bundles the React app; the Express API runs separately on PORT (default 3000).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
