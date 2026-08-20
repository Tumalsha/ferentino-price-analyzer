// Seeds every category with the same starting rates from the source
// spreadsheet. Admin can override a specific category's rates later if
// that brand's actual terms differ there (e.g. CEAT's two-wheeler terms
// vs their car-tyre terms) — see useLandingPriceStore.
export const VAT_RATE = 0.18;

// Brands with a full landing-price calculation (dealer price → landing).
// EPIC appears in the source sheet as a tracked dealer price only, with
// no landing formula built around it — left out here; ask if you want it added.
export const LANDING_BRANDS = ['CEAT', 'DSI', 'MRF'];

export const DEFAULT_RATE_CONFIG = {
  FTC: {
    calcMode: 'two_stage', // distributor% off dealer price first, then remaining rates off that result
    focRatio: null, // no FOC step for Ferentino's own price in the source model
    steps: [
      { key: 'distributor', label: 'Distributor', rate: 0.07 },
      { key: 'qty', label: 'Qty', rate: 0.18 },
      { key: 'cash', label: 'Cash', rate: 0.05 },
      { key: 'deposits', label: 'Deposits', rate: 0 },
      { key: 'special', label: 'Special', rate: 0.04 },
    ],
  },
  CEAT: {
    calcMode: 'flat', // all rates subtracted directly off dealer price
    focRatio: 10, // 10:1 bonus stock
    steps: [
      { key: 'distributor', label: 'Distributor', rate: 0.05 },
      { key: 'qty', label: 'Qty', rate: 0.165 },
      { key: 'cash', label: 'Cash', rate: 0.05 },
      { key: 'sds', label: 'SDS', rate: 0.03 },
    ],
  },
  DSI: {
    calcMode: 'flat',
    focRatio: 10,
    steps: [
      { key: 'distributor', label: 'Distributor', rate: 0.05 },
      { key: 'qty', label: 'Qty', rate: 0.17 },
      { key: 'cash', label: 'Cash', rate: 0.06 },
      { key: 'qtr', label: 'QTR', rate: 0.03 },
    ],
  },
  MRF: {
    calcMode: 'flat',
    focRatio: 10,
    steps: [
      { key: 'qty', label: 'Qty', rate: 0.25 },
      { key: 'cash', label: 'Cash', rate: 0.05 },
      { key: 'line', label: 'Line', rate: 0.05 },
    ],
  },
};
