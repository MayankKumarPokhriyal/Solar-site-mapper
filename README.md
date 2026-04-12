# Solar Site Mapper

Local full-stack app: geocode U.S. addresses with Nominatim, map valid coordinates with Leaflet, then pull solar resource and PVWatts estimates from NREL for each site.

## Prerequisites

- Node.js 18 or newer (includes `node --watch` for the API dev server)

## Setup

1. **Install dependencies**

   ```bash
   npm run install:all
   ```

   Or install each package separately:

   ```bash
   npm install --prefix server
   npm install --prefix client
   ```

2. **Configure NREL**

   Copy the example env file and add your key from [NREL Developer Network](https://developer.nrel.gov/signup/):

   ```bash
   cp server/.env.example server/.env
   ```

   Edit `server/.env` and set `NREL_API_KEY` to your key. The solar and PVWatts endpoints require it.

## Run locally

**Option A — one command from the repo root (after `npm install` in the root for `concurrently`):**

```bash
npm install
npm run dev
```

**Option B — two terminals:**

```bash
# Terminal 1 — API on http://localhost:3000
npm run dev --prefix server

# Terminal 2 — Vite on http://localhost:5173
npm run dev --prefix client
```

Open **http://localhost:5173** in your browser. The UI calls the API at `http://localhost:3000` by default (override with `VITE_API_URL` in `client/.env` if needed).

## Project layout

- `server/` — Express API (`/api/geocode`, `/api/solar`, `/api/pvwatts`)
- `client/` — React + Vite + Leaflet frontend

Sites you add are stored in **localStorage** so a refresh does not clear the list.

## Phase 2 note

When the final assessment site list is available, you can preload addresses from `client/src/config/initialSites.js` without changing the API or routing.

## How to test

After starting the stack (`npm run dev` from the repo root: API on **http://localhost:3000**, UI on **http://localhost:5173**):

1. Enter at least 5 valid U.S. addresses.
2. Click **Add Site**.
3. Markers will appear on the map.
4. Click any marker to view solar resource and PVWatts data.

**Note:** The application dynamically ingests addresses (no preloaded data), as required by the assignment.

## Error handling

- Empty input → **"Address is required"** (client-side on submit, or from the API if the address query is blank).
- Invalid or unresolvable address → **"Address not found"** (no geocoding hit from Nominatim).
- Geocoding rate limit → **"Geocoding rate limit exceeded"** (Nominatim HTTP 429).
- NREL rate limit → handled with one automatic retry, then a clear message (for example **"NREL rate limit—try again in a minute"**) if the limit still applies.

## Architecture

- **Frontend:** React + Leaflet (UI, state, routing).
- **Backend:** Express (API proxy, validation).
- **Services:**
  - **Nominatim** → geocoding.
  - **NREL** → solar resource + PVWatts.
- **Separation of concerns:** UI → API layer (`client/src/services/api.js`) → backend routes → controllers → services.

## Invalid address handling

If geocoding fails:

- The site is marked **invalid** in application state.
- The error message is stored on the site row.
- **No marker** is shown on the map (only resolved coordinates get markers).
- The **detail page** shows the error clearly for that site.
