# Ferentino Price List

## Run it in Antigravity
1. Unzip this project into your Antigravity workspace.
2. Open the terminal and run: `npm install`
3. Then: `npm run dev`
4. Open the local URL Vite prints (usually http://localhost:5173).

## Deploying to Vercel
The React frontend and Node API are deployed together. The API exposes
`/api/auth/login`, `/api/tyres`, `/api/price-overrides`, `/api/rate-configs`,
and `/api/dealer-prices`, with MongoDB as the persistent store.

## Vercel and MongoDB setup
1. Create a MongoDB Atlas database and allow Vercel traffic in its network access settings.
2. In the Vercel project settings, add `MONGODB_URI`, `MONGODB_DB`, `ADMIN_USERNAME`,
   and a strong `ADMIN_PASSWORD`.
3. Add a long random `JWT_SECRET`. Keep all of these variables server-only.
4. Leave `VITE_API_URL` empty for this same-project API, then redeploy.

On first API access, the `tyres` collection is seeded from the catalog JSON files.
Price overrides, dealer prices, and rate configurations are stored in MongoDB.
For local development, set `VITE_API_URL=http://localhost:4000` and run the API
with a Node server that uses the same environment variables.

## Project structure
```
src/
  data/
    categories.js          <- registry: add new categories here
    passengerCarRadial.json
    eternopresa.json
    celestra.json
    lcv.json
    truckLightTruck.json
    twoThreeWheeler.json
  components/
    Header.jsx              <- red top banner
    Sidebar.jsx              <- 6 category buttons
    Toolbar.jsx              <- search + VAT toggle
    PriceTable.jsx            <- reusable table w/ sub-group headers
    Footer.jsx
  App.jsx                    <- wires state (active category, search, sort, VAT mode)
```

## Adding a 7th category later
1. Add a new JSON file in `src/data/` following the same shape:
   `{ label, description, groups: [{ groupLabel, items: [{ size, pattern, exVat, incVat }] }] }`
2. Import it and add one line to the `categories` array in `src/data/categories.js`.
That's it — Sidebar, Toolbar, and PriceTable all read from that array automatically.

## Known data caveats
- Some raw PDF pages repeated table rows in the plain-text extraction (an OCR/parsing
  artifact, not real duplicate pricing). The JSON here has been de-duplicated against
  the visible table images, not the raw text dump.
- All prices are effective 11th April 2026 per the source PDF and are VAT-inclusive
  where marked "With VAT" (18% VAT).
