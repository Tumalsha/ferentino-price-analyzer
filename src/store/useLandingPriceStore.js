import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_RATE_CONFIG } from '../data/landingPriceDefaults.js';

const RATES_KEY = 'ferentino-landing-rates'; // { "<categoryId>::<brand>": { calcMode, focRatio, steps } }
const DEALER_PRICES_KEY = 'ferentino-dealer-prices'; // { "<rowKey>": { ftcExVat, CEAT, DSI, MRF } }

function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useLandingPriceStore() {
  const [rateOverrides, setRateOverrides] = useState(() => load(RATES_KEY));
  const [dealerPrices, setDealerPrices] = useState(() => load(DEALER_PRICES_KEY));

  useEffect(() => {
    localStorage.setItem(RATES_KEY, JSON.stringify(rateOverrides));
  }, [rateOverrides]);

  useEffect(() => {
    localStorage.setItem(DEALER_PRICES_KEY, JSON.stringify(dealerPrices));
  }, [dealerPrices]);

  // Every category starts on DEFAULT_RATE_CONFIG until explicitly overridden —
  // that's what lets rates "differ per category" without forcing 24 setups upfront.
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
  }, []);

  const setFocRatio = useCallback((categoryId, brand, value) => {
    const key = `${categoryId}::${brand}`;
    setRateOverrides((prev) => {
      const base = prev[key] ?? DEFAULT_RATE_CONFIG[brand];
      return { ...prev, [key]: { ...base, focRatio: value === '' ? null : Number(value) } };
    });
  }, []);

  const getDealerPrice = useCallback((rowKey, field) => dealerPrices[rowKey]?.[field] ?? null, [dealerPrices]);

  const setDealerPrice = useCallback((rowKey, field, value) => {
    setDealerPrices((prev) => ({
      ...prev,
      [rowKey]: { ...prev[rowKey], [field]: value === '' ? null : Number(value) },
    }));
  }, []);

  return { getRateConfig, setStepRate, setFocRatio, getDealerPrice, setDealerPrice };
}
