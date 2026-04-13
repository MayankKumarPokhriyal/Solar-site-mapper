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

### Screenshot 1 — Map page with sites + markers
What it demonstrates:
- Dynamic address ingestion
- Valid/invalid status handling
- Multiple mapped sites
- Marker-based visualization

![Map page with markers and site list](./assets/Screenshot_2026-04-13_at_2.35.55_PM-305d6e4a-6bab-4a2b-88e3-d383489cc267.png)

### Screenshot 2 — Site detail page with solar + PVWatts data
What it demonstrates:
- Detail page navigation per site
- Address + coordinates display
- Solar resource metrics
- PVWatts estimate metrics

![Site detail page with NREL solar and PVWatts](./assets/Screenshot_2026-04-13_at_2.36.04_PM-44b00571-c55c-4a8c-bf53-21db0287c03d.png)

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