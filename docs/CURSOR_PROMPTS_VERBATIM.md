# Cursor prompts (verbatim)

Exact prompts used while building and reviewing **Solar Site Mapper**.  
Reproduced from the author’s Cursor sessions.

---

## Prompt 1 — Initial full project build

```
You are helping me build a production-quality full-stack web application for a technical assessment.

I am a beginner, so I need you to do two things at the same time:
1. Build the application correctly.
2. Make the code easy for me to understand by adding clear, beginner-friendly comments in the code.

Use clean, modular, maintainable code with proper separation of concerns.

==================================================
PROJECT CONTEXT
==================================================

This project is a local web application.

The business goal is to build a mapping application for U.S. sites where a user can:
- enter a street address
- convert that address into latitude/longitude using geocoding
- display the resolved site on a map
- click into a detail page for that site
- retrieve solar resource / irradiance data for that site
- run a basic PVWatts estimate for that location

This app must run locally only.
No cloud deployment is required.

A very important requirement of the assessment is this:

Do NOT build the app as a fixed 5-site hardcoded project from the beginning.

Instead, build it in a way that supports a first working version where users can dynamically enter site addresses and the app processes them correctly.

Later, in phase 2, the actual 5 sites will be provided and the working app should be easy to update without rebuilding the architecture.

Also, one of the later addresses may be intentionally invalid or non-resolvable.
The app must handle that gracefully and clearly explain what went wrong.

So the architecture must support:
- dynamic address input
- future replacement/update of site list
- clean invalid-address handling
- modular code that is easy to extend

==================================================
TECH STACK
==================================================

Use this exact stack:

Frontend:
- React with Vite
- React Router
- Axios
- Leaflet
- react-leaflet

Backend:
- Node.js
- Express

Project structure:
- /client   -> React frontend
- /server   -> Express backend

==================================================
HIGH-LEVEL GOAL
==================================================

Build a local full-stack web app that:

1. Accepts site street addresses from the user
2. Geocodes the address into latitude/longitude using Nominatim
3. Displays valid resolved sites on a U.S. map with markers
4. Lets the user click a marker or a site entry to open a site detail page
5. On the detail page, retrieves solar resource data from NREL
6. Uses the resolved coordinates to run a simple PVWatts estimate from NREL
7. Clearly handles invalid addresses or failed API calls
8. Is easy to update later when the final 5 sites are provided

==================================================
PHASE-BASED ARCHITECTURE REQUIREMENT
==================================================

Build this project with a two-phase mindset.

PHASE 1:
Create the first working version that supports:
- ingesting site addresses dynamically
- resolving addresses to coordinates
- mapping valid sites
- loading a site detail page
- calling the solar resource workflow
- calling PVWatts
- gracefully handling invalid addresses
- displaying clear UI messages for errors

PHASE 2:
The architecture should make it easy to later replace or preload the final 5 real sites without redesigning the whole app.

Do NOT tightly couple the app to a hardcoded initial dataset.

==================================================
BACKEND REQUIREMENTS
==================================================

Create an Express server inside /server.

Use these packages:
- express
- cors
- dotenv
- axios

Add middleware:
- cors()
- express.json()
- dotenv configuration

Create the following API endpoints:

1. GET /api/geocode?address=
Purpose:
- Accept a street address string
- Call the Nominatim geocoding API
- Convert the address into latitude and longitude

Behavior:
- If the address resolves successfully, return:
  {
    success: true,
    data: {
      lat: number,
      lon: number,
      displayName: string
    }
  }

- If the address is empty, invalid, or no results are found, return:
  {
    success: false,
    error: "Address not found"
  }

2. GET /api/solar?lat=&lon=
Purpose:
- Accept latitude and longitude
- Call the NREL Solar Resource API
- Return only the useful solar resource fields in a clean structure

Example response style:
  {
    success: true,
    data: {
      avgDni: ...,
      avgGhi: ...,
      avgLatTilt: ...
    }
  }

3. GET /api/pvwatts?lat=&lon=
Purpose:
- Accept latitude and longitude
- Call the NREL PVWatts API
- Return only important summary fields

Example response style:
  {
    success: true,
    data: {
      acAnnual: ...,
      capacityFactor: ...,
      solradAnnual: ...
    }
  }

Use .env for configuration:
- NREL_API_KEY=your_key_here

==================================================
BACKEND ERROR HANDLING
==================================================

Use proper try/catch blocks for all external API calls.

Handle all of the following safely:
- missing query params
- empty address input
- invalid latitude/longitude
- empty geocode response
- Nominatim failure
- NREL solar API failure
- NREL PVWatts API failure
- unexpected server errors

All backend endpoints must return structured JSON:
- success true with data
- success false with error message

Do not let the server crash because of bad input or failed external API calls.

==================================================
FRONTEND REQUIREMENTS
==================================================

Create the frontend inside /client using React + Vite.

Install and use:
- axios
- react-router-dom
- leaflet
- react-leaflet

Set up routing:
- "/"              -> Map Page
- "/site/:id"      -> Site Detail Page

==================================================
FRONTEND APPLICATION BEHAVIOR
==================================================

The app should initially work without hardcoding the final 5 assessment sites.

Instead, the app should allow the user to add addresses dynamically.

Main user flow:
1. User types an address into an input field
2. User clicks "Add Site"
3. Frontend calls /api/geocode
4. If geocoding succeeds:
   - save the site in application state
   - place a marker on the map
5. If geocoding fails:
   - save it as invalid or show an error
   - display a clear error message in the UI
6. User clicks a marker or site item
7. App navigates to /site/:id
8. Detail page shows address + coordinates
9. Detail page calls:
   - /api/solar
   - /api/pvwatts
10. Detail page displays solar and PVWatts results clearly

==================================================
MAP PAGE REQUIREMENTS
==================================================

The map page must include:
- a page title
- a text input for entering a site address
- an "Add Site" button
- a map centered on the U.S.
- markers for all valid resolved sites
- a simple list or summary of sites added so far

Map defaults:
- center on the United States
- zoom around 4

Each marker should be clickable.
Clicking a marker should navigate to the corresponding site detail page.

Also allow clicking a site from a list to open the detail page.

The page must support at least 5 sites eventually, but do not hardcode the final 5 right now.

==================================================
DETAIL PAGE REQUIREMENTS
==================================================

The site detail page should:
- read the site id from the route
- find the corresponding site from state or storage
- show:
  - address
  - latitude
  - longitude
  - current status

Then fetch:
- solar resource data from /api/solar
- PVWatts estimate from /api/pvwatts

Display the results in a clean readable format.

At minimum, show:
Solar data:
- average DNI
- average GHI
- average latitude tilt irradiance

PVWatts data:
- annual AC energy
- capacity factor
- annual solar radiation if available

==================================================
SITE DATA MODEL
==================================================

Use a consistent site object shape like this:

{
  id,
  address,
  lat,
  lon,
  status: "pending" | "valid" | "invalid",
  error: null | string
}

Explanation:
- pending -> request is in progress
- valid -> geocoding succeeded
- invalid -> address failed or could not be resolved

==================================================
STATE MANAGEMENT
==================================================

Keep the state management simple but clean.

You may use:
- React state
- React context if needed

Prefer a solution that is easy to understand.

If needed, persist sites in localStorage so that refreshing the page does not immediately erase the working state.

If you use localStorage, comment the code clearly.

==================================================
UI / UX REQUIREMENTS
==================================================

The UI should be minimal, clean, and functional.

Must include:
- loading state while geocoding
- loading state while fetching solar data
- loading state while fetching PVWatts data
- error message for invalid address
- error message for failed solar/PV API calls
- safe fallback UI
- no crashes

Examples of good UI behavior:
- show "Resolving address..." while geocoding
- show "Address not found" for unresolved addresses
- show "Failed to load solar data" if API fails
- disable submit button while request is in progress

==================================================
CODE QUALITY REQUIREMENTS
==================================================

This is very important.

Write code as if another engineer will review it.

Requirements:
- clean folder structure
- modular files
- reusable functions
- small components where appropriate
- separate API logic from UI logic
- separate backend route/controller/service responsibilities where reasonable

Also:
- add clear comments throughout the code
- comments must help a beginner understand what each file and major function is doing
- explain why something is being done, not just what is being done
- do not over-comment obvious lines, but do comment important logic, API calls, routing, state updates, and error handling

Examples of comment style I want:
- "This function sends the user-entered address to the backend for geocoding."
- "We store only valid resolved sites as map markers because invalid addresses do not have coordinates."
- "This route calls the NREL solar resource API using the latitude and longitude from the resolved address."

==================================================
SUGGESTED FILE ORGANIZATION
==================================================

Use a clean structure similar to this if appropriate:

/server
  /src
    /routes
    /controllers
    /services
    /utils
    app.js
    server.js
  .env
  package.json

/client
  /src
    /components
    /pages
    /services
    /context
    /utils
    App.jsx
    main.jsx
  package.json

You may improve this structure if needed, but keep it simple and beginner-friendly.

==================================================
IMPLEMENTATION DETAILS
==================================================

Backend:
- create route files for geocode, solar, pvwatts
- create service functions for calling external APIs
- validate input before calling APIs
- normalize response data before sending to frontend

Frontend:
- create reusable components where helpful
- create a map component
- create form component for adding a site
- create site list component if useful
- create site detail page
- create service file for backend API calls
- use React Router properly

==================================================
IMPORTANT CONSTRAINTS
==================================================

- Must run locally
- No cloud deployment
- Must use real reachable APIs
- Must not skip invalid-address handling
- Must not hardcode the final assessment sites initially
- Must be easy to update later with the actual 5 sites
- Must be understandable to a beginner
- Must include proper comments in code

==================================================
WHAT I WANT YOU TO GENERATE
==================================================

Generate the complete project step by step.

I want:
1. Full /server code
2. Full /client code
3. All required files
4. Proper folder structure
5. Package dependencies
6. .env.example if useful
7. Instructions to run locally
8. Clear comments in code for learning
9. Clean implementation, not pseudo-code

When generating code:
- do not skip files
- do not leave placeholders like "implement later"
- do not give only partial snippets
- give real working code
- explain file purpose briefly before each file if helpful

If a design choice is made, choose the simplest clean option that satisfies the assessment.

Start by generating the complete folder structure, then the backend files, then the frontend files, then the run instructions.

you can ask me any questions if you have
```

---

## Prompt 2 — Requirements audit

```
Audit this full-stack project against the following requirements and tell me if anything is missing or incorrect.

Check:

1. Backend:
- Does /api/geocode use Nominatim correctly with User-Agent?
- Does it return { success, data | error } format?
- Does it handle invalid/empty address properly?
- Does /api/solar call NREL Solar Resource API and return cleaned fields?
- Does /api/pvwatts call NREL PVWatts API with correct params?
- Are all endpoints wrapped in try/catch with safe error handling?

2. Frontend:
- Can user input an address and add a site dynamically?
- Is geocoding called on submit?
- Are valid sites shown as markers on Leaflet map?
- Does clicking a marker navigate to /site/:id?
- Does detail page fetch solar + pvwatts data?
- Are loading and error states handled properly?

3. State:
- Is site object structured as:
  { id, address, lat, lon, status, error }?
- Is localStorage persistence implemented correctly?
- Does refresh preserve sites?

4. Edge cases:
- Invalid address shows clear message?
- Failed API calls handled without crash?
- Duplicate addresses handled?

5. Architecture:
- Separation between UI, API layer, backend services?
- Easy to update site list later (no hardcoding)?

Give:
- PASS / FAIL for each section
- List of issues if any
- Exact fixes needed
```

---

## Prompt 3 — 429 rate limit on detail page

```
why its giving me like this 

← Back to map

Site details
Address: 27 Glenwood Ave

Status: valid

Coordinates: 51.51998, 0.19708

Solar resource (NREL)
Solar API returned status 429

PVWatts estimate (NREL)
PVWatts API returned status 429
```

---

## Prompt 4 — Strict assignment compliance audit

```
Audit this project strictly against the official assignment requirements and evaluation criteria.

Use the following checklist and give PASS / FAIL for each item, with exact issues and fixes.

=========================
ASSIGNMENT COMPLIANCE CHECK
=========================

1. CORE OBJECTIVE
- Does the app display at least 5 sites on a map?
- Can user click a site and open a detail page?
- Does each site retrieve solar resource data?
- Does each site run a PVWatts calculation?

Reference: Objective section  [oai_citation:0‡Software Engineer Intern - Technical Assessment.pdf](sediment://file_00000000e80071f5a0891e601d5c6d9e)

-------------------------

2. PHASE 1 REQUIREMENT (CRITICAL)
- Does the app support dynamic address input (NOT hardcoded)?
- Does it:
  - ingest addresses
  - convert address → lat/lon
  - map them
  - open detail page
  - call solar workflow?

- Is architecture flexible for Phase 2 updates?

Reference: Workflow requirement  [oai_citation:1‡Software Engineer Intern - Technical Assessment.pdf](sediment://file_00000000e80071f5a0891e601d5c6d9e)

-------------------------

3. GEOCODING
- Is a geocoding service (Nominatim or equivalent) used?
- Does it correctly convert address → lat/lon?
- Are invalid / empty addresses handled clearly?

Reference: Data expectations  [oai_citation:2‡Software Engineer Intern - Technical Assessment.pdf](sediment://file_00000000e80071f5a0891e601d5c6d9e)

-------------------------

4. MAP FUNCTIONALITY
- Is there a map-based landing page?
- Are markers shown for each valid site?
- Are invalid sites excluded from markers?

Reference: Minimum requirements  [oai_citation:3‡Software Engineer Intern - Technical Assessment.pdf](sediment://file_00000000e80071f5a0891e601d5c6d9e)

-------------------------

5. SITE DETAIL PAGE
- Does each site have a working detail page?
- Does it display:
  - address
  - coordinates
- Does it fetch:
  - solar resource data
  - PVWatts data?

-------------------------

6. SOLAR + PVWATTS APIs
- Are NREL APIs used correctly with lat/lon?
- Are required parameters passed?
- Are responses cleaned (not raw API dump)?

-------------------------

7. ERROR HANDLING (CRITICAL)
- Invalid address → clear message?
- Empty input → clear message?
- API failure → handled without crash?
- Rate limit (429) → handled gracefully?

Reference: invalid data note  [oai_citation:4‡Software Engineer Intern - Technical Assessment.pdf](sediment://file_00000000e80071f5a0891e601d5c6d9e)

-------------------------

8. DATA MODEL
- Does each site object include:
  { id, address, lat, lon, status, error }?
- Is status properly updated:
  pending → valid / invalid?

Reference: Suggested data model  [oai_citation:5‡Software Engineer Intern - Technical Assessment.pdf](sediment://file_00000000e80071f5a0891e601d5c6d9e)

-------------------------

9. STATE & PERSISTENCE
- Is state managed cleanly?
- Is localStorage used to persist sites?
- Does refresh preserve data?

-------------------------

10. UPDATEABILITY (VERY IMPORTANT)
- Can site list be updated easily later?
- Is app NOT tightly coupled to initial dataset?
- Can new 5 sites be added without rewriting logic?

Reference: evaluation criteria  [oai_citation:6‡Software Engineer Intern - Technical Assessment.pdf](sediment://file_00000000e80071f5a0891e601d5c6d9e)

-------------------------

11. CODE QUALITY
- Is code modular (routes, services, components)?
- Is separation of concerns clear?
- Are comments meaningful and helpful?

Reference: evaluation criteria  [oai_citation:7‡Software Engineer Intern - Technical Assessment.pdf](sediment://file_00000000e80071f5a0891e601d5c6d9e)

-------------------------

12. END-TO-END FUNCTIONALITY
- Does full flow work:
  input → geocode → map → detail → solar → pvwatts?
- Does app run locally without errors?

-------------------------

13. API USAGE QUALITY
- Are APIs used within limits?
- Are unnecessary calls avoided?
- Is caching or optimization present (optional)?

Reference: evaluation criteria  [oai_citation:8‡Software Engineer Intern - Technical Assessment.pdf](sediment://file_00000000e80071f5a0891e601d5c6d9e)

=========================
OUTPUT FORMAT
=========================

For each section:
- PASS / FAIL
- If FAIL → exact issue
- Exact fix (code-level suggestion)

Then give:
- FINAL VERDICT: READY / NOT READY FOR SUBMISSION
- List of must-fix items before submission
```

---

## Prompt 5 — Duplicate `addSite` / stale closure bug

```
Verify these issues exist and fix them:

Bug 1:
The `addSite` callback function is created with `[sites]` as the dependency array, which means it captures the `sites` value from when it was created due to closure. On line 74, the duplicate address check uses this captured `sites` value directly. If two rapid submissions occur before a re-render completes, both calls will check against the same stale `sites` list, allowing both to pass the duplicate check and add the same address twice.
```
