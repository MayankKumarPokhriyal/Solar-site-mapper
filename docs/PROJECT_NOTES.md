# Solar Site Mapper — Project Notes

## Repository Link
GitHub: [https://github.com/MayankKumarPokhriyal/Solar-site-mapper/tree/main](https://github.com/MayankKumarPokhriyal/Solar-site-mapper/tree/main)

---

## 1) What I built

I built a local full-stack web application called **Solar Site Mapper**.

The app allows a user to:

1. Enter a U.S. street address
2. Geocode the address into latitude/longitude using **Nominatim**
3. Show valid sites as markers on a **Leaflet** map
4. Open a detail page for each site
5. Fetch solar resource data from **NREL Solar Resource API**
6. Run a PV estimate from **NREL PVWatts API**
7. Handle invalid addresses and API failures gracefully

The architecture was designed in a **Phase 1 -> Phase 2** style:
- **Phase 1:** dynamic address input (no hardcoded final 5 sites)
- **Phase 2:** easy future preload/update of official final site list without redesigning the app

---

## 2) Tech Stack

### Frontend
- React (Vite)
- React Router
- Axios
- Leaflet + react-leaflet

### Backend
- Node.js
- Express
- Axios
- dotenv
- cors

---

## 3) How I completed this project (development flow)

I followed a modular full-stack approach:

1. **Set up project structure**
   - `/client` for React frontend
   - `/server` for Express backend
2. **Built backend APIs first**
   - `GET /api/geocode`
   - `GET /api/solar`
   - `GET /api/pvwatts`
3. **Implemented service-layer integrations**
   - Nominatim geocoding
   - NREL solar + PVWatts
4. **Added robust validation and error handling**
   - Empty/invalid address checks
   - Invalid lat/lon checks
   - Structured JSON responses
5. **Built frontend workflow**
   - Map page + add-address form
   - Site list + marker navigation
   - Detail page for site metrics
6. **Implemented state management**
   - Context API for site state
   - `localStorage` persistence to survive refresh
7. **Improved reliability**
   - Duplicate-address protection
   - Loading and error states
   - Rate-limit handling (429 messaging + retry strategy)
   - NREL caching (TTL + in-flight dedupe)
8. **Final polish**
   - Beginner-friendly comments
   - Documentation + run instructions

---

## 4) Prompts I used while working in Cursor

I used iterative prompts to build and improve quality. Main prompt categories:

### A) Initial full build prompt
I asked Cursor to build a complete production-quality full-stack app with:
- dynamic input architecture
- React + Express stack
- clean modular code
- beginner-friendly comments
- Phase 1/Phase 2 flexibility

### B) Audit prompt
I asked Cursor to audit:
- backend endpoint correctness
- frontend behavior
- state model
- edge cases
- architecture separation

### C) 429 issue debugging prompt
I asked why detail page showed:
- `Solar API returned status 429`
- `PVWatts API returned status 429`

This helped improve graceful rate-limit handling and user-facing error clarity.

### D) Strict assignment compliance prompt
I asked for PASS/FAIL checks against each assignment criterion with exact fixes.

### E) Bug-fix prompt
I asked Cursor to verify/fix duplicate handling closure issue in `addSite` when rapid submissions happen before rerender.

These prompts helped me move from “working app” to “submission-ready app”.

---

## 5) Screenshots

These notes embed the two PNGs in [`docs/assets/`](./assets/). Paths are relative to this file.

| Screenshot file | What it maps to in these notes |
|-----------------|--------------------------------|
| [`landing Page.png`](./assets/landing%20Page.png) | **Map / landing page** — address input, U.S. map with markers, site list with valid/invalid badges |
| [`site Details Page.png`](./assets/site%20Details%20Page.png) | **Site detail page** — address, coordinates, NREL solar resource + PVWatts panels |

### Screenshot 1 — Map page (landing)

**File:** `docs/assets/landing Page.png`

What it demonstrates:

- Dynamic address ingestion
- Valid/invalid status handling
- Multiple mapped sites
- Marker-based visualization

![Map page — landing Page.png](./assets/landing%20Page.png)

### Screenshot 2 — Site detail page

**File:** `docs/assets/site Details Page.png`

What it demonstrates:

- Detail page for a resolved site
- Address + coordinates
- Solar resource metrics (DNI, GHI, latitude tilt)
- PVWatts metrics (annual AC energy, capacity factor, solar radiation)

![Site detail page — site Details Page.png](./assets/site%20Details%20Page.png)

---

## 6) Submission requirements

### Source code
- GitHub repository link:  
  [https://github.com/MayankKumarPokhriyal/Solar-site-mapper/tree/main](https://github.com/MayankKumarPokhriyal/Solar-site-mapper/tree/main)
- Zipped source is prepared separately.

### Local run instructions

#### Prerequisites

- Node.js 18+

#### Install

```bash
npm run install:all
```

Or install each package separately:

```bash
npm install --prefix server
npm install --prefix client
```

#### Configure NREL

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and set `NREL_API_KEY`. The solar and PVWatts routes require it.

#### Run

**Option A — one command from the repo root** (after `npm install` in the root for `concurrently`):

```bash
npm install
npm run dev
```

**Option B — two terminals:**

```bash
npm run dev --prefix server
npm run dev --prefix client
```

#### URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000` (override with `VITE_API_URL` in `client/.env` if needed)

---

## 7) Required environment variables

### `server/.env`

- `NREL_API_KEY` — required for `/api/solar` and `/api/pvwatts`
- `PORT` — optional (defaults to `3000`)

### `client/.env` (optional)

- `VITE_API_URL` — optional API base URL override

---

## 8) Appendix: full Cursor prompts (verbatim)

See [CURSOR_PROMPTS_VERBATIM.md](./CURSOR_PROMPTS_VERBATIM.md) for the complete text of each prompt used during development.