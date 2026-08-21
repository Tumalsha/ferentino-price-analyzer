import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_RATE_CONFIG } from '../data/landingPriceDefaults.js';
import { useAuth } from '../auth/AuthContext.jsx';

const RATES_KEY = 'ferentino-landing-rates';       // { "<categoryId>::<brand>": config }  — category defaults
const ROW_RATES_KEY = 'ferentino-row-landing-rates'; // { "<rowKey>::<brand>": config }    — per-tyre overrides
const DEALER_PRICES_KEY = 'ferentino-dealer-prices'; // { "<rowKey>": { ftcWithVat, CEAT, DSI, MRF } }
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'ferentino-admin-token';

function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useLandingPriceStore() {
  const { isAuthenticated } = useAuth();
  const [rateOverrides, setRateOverrides] = useState(() => load(RATES_KEY));
  const [rowRateOverrides, setRowRateOverrides] = useState(() => load(ROW_RATES_KEY));
  const [dealerPrices, setDealerPrices] = useState(() => load(DEALER_PRICES_KEY));

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_URL}/api/rate-configs`, { headers }),
      fetch(`${API_URL}/api/dealer-prices`, { headers }),
    ]).then(async ([ratesResponse, pricesResponse]) => {
      if (!ratesResponse.ok || !pricesResponse.ok) return;
      const [rates, prices] = await Promise.all([ratesResponse.json(), pricesResponse.json()]);
      setRateOverrides(Object.fromEntries(rates.map((config) => [`${config.categoryId}::${config.brand}`, config])));
      setDealerPrices(Object.fromEntries(prices.map((price) => [price.rowKey, {
          ftcWithVat: price.ftcExVat,
          CEAT: price.CEAT,
          DSI: price.DSI,
          MRF: price.MRF,
        }])));
      localStorage.removeItem(RATES_KEY);
      localStorage.removeItem(DEALER_PRICES_KEY);
    }).catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => { localStorage.setItem(RATES_KEY, JSON.stringify(rateOverrides)); }, [rateOverrides]);
  useEffect(() => { localStorage.setItem(ROW_RATES_KEY, JSON.stringify(rowRateOverrides)); }, [rowRateOverrides]);
  useEffect(() => { localStorage.setItem(DEALER_PRICES_KEY, JSON.stringify(dealerPrices)); }, [dealerPrices]);

  // ── Category-level (default) rates ──────────────────────────────────────────

  // Every category starts on DEFAULT_RATE_CONFIG until explicitly overridden.
  const getRateConfig = useCallback(
    (categoryId, brand) => rateOverrides[`${categoryId}::${brand}`] ?? DEFAULT_RATE_CONFIG[brand],
    [rateOverrides]
  );

  const setStepRate = useCallback((categoryId, brand, stepKey, rate) => {
    const key = `${categoryId}::${brand}`;
    setRateOverrides((prev) => {
      const base = prev[key] ?? DEFAULT_RATE_CONFIG[brand];
      return {
        ...prev,
        [key]: { ...base, steps: base.steps.map((s) => (s.key === stepKey ? { ...s, rate: Number(rate) } : s)) },
      };
    });
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) {
      fetch(`${API_URL}/api/rate-configs/${categoryId}/${brand}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stepKey, rate: Number(rate) }),
      }).catch(() => {});
    }
  }, []);

  const setFocRatio = useCallback((categoryId, brand, value) => {
    const key = `${categoryId}::${brand}`;
    setRateOverrides((prev) => {
      const base = prev[key] ?? DEFAULT_RATE_CONFIG[brand];
      return { ...prev, [key]: { ...base, focRatio: value === '' ? null : Number(value) } };
    });
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) {
      fetch(`${API_URL}/api/rate-configs/${categoryId}/${brand}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ focRatio: value === '' ? null : Number(value) }),
      }).catch(() => {});
    }
  }, []);

  // ── Row-level (per-tyre) rate overrides ─────────────────────────────────────

  // Falls back to the category default, which itself falls back to DEFAULT_RATE_CONFIG.
  const getRowRateConfig = useCallback(
    (rowKey, categoryId, brand) =>
      rowRateOverrides[`${rowKey}::${brand}`] ??
      rateOverrides[`${categoryId}::${brand}`] ??
      DEFAULT_RATE_CONFIG[brand],
    [rowRateOverrides, rateOverrides]
  );

  // Returns true if this row has any overrides for this brand (used to highlight the toggle).
  const rowHasOverride = useCallback(
    (rowKey, brand) => Boolean(rowRateOverrides[`${rowKey}::${brand}`]),
    [rowRateOverrides]
  );

  const setRowStepRate = useCallback((rowKey, categoryId, brand, stepKey, rate) => {
    const key = `${rowKey}::${brand}`;
    setRowRateOverrides((prev) => {
      // Seed from the current effective config for this row so we don't lose other steps.
      const base =
        prev[key] ??
        rateOverrides[`${categoryId}::${brand}`] ??
        DEFAULT_RATE_CONFIG[brand];
      return {
        ...prev,
        [key]: { ...base, steps: base.steps.map((s) => (s.key === stepKey ? { ...s, rate: Number(rate) } : s)) },
      };
    });
  }, [rateOverrides]);

  const setRowFocRatio = useCallback((rowKey, categoryId, brand, value) => {
    const key = `${rowKey}::${brand}`;
    setRowRateOverrides((prev) => {
      const base =
        prev[key] ??
        rateOverrides[`${categoryId}::${brand}`] ??
        DEFAULT_RATE_CONFIG[brand];
      return { ...prev, [key]: { ...base, focRatio: value === '' ? null : Number(value) } };
    });
  }, [rateOverrides]);

  // Clears row-level overrides for all brands on a given row (resets to category default).
  const resetRowRates = useCallback((rowKey) => {
    setRowRateOverrides((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => { if (k.startsWith(`${rowKey}::`)) delete next[k]; });
      return next;
    });
  }, []);

  // ── Dealer prices ────────────────────────────────────────────────────────────

  const getDealerPrice = useCallback((rowKey, field) => dealerPrices[rowKey]?.[field] ?? null, [dealerPrices]);

  const setDealerPrice = useCallback((rowKey, field, value) => {
    const nextValue = value === '' ? null : Number(value);
    setDealerPrices((prev) => ({
      ...prev,
      [rowKey]: { ...prev[rowKey], [field]: nextValue },
    }));
    const token = sessionStorage.getItem(TOKEN_KEY);
    const backendField = field === 'ftcWithVat' ? 'ftcExVat' : field;
    if (token) {
      fetch(`${API_URL}/api/dealer-prices/${encodeURIComponent(rowKey)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ field: backendField, value: nextValue }),
      }).catch(() => {});
    }
  }, []);

  return {
    // category defaults
    getRateConfig, setStepRate, setFocRatio,
    // row overrides
    getRowRateConfig, rowHasOverride, setRowStepRate, setRowFocRatio, resetRowRates,
    // dealer prices
    getDealerPrice, setDealerPrice,
    // raw state (use as useEffect dependencies to react to any change)
    dealerPrices, rateOverrides, rowRateOverrides,
  };
}
