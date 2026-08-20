# Ferentino Price List

## Run it in Antigravity
1. Unzip this project into your Antigravity workspace.
2. Open the terminal and run: `npm install`
3. Then: `npm run dev`
4. Open the local URL Vite prints (usually http://localhost:5173).

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
