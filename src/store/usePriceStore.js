import { createContext, useCallback, useContext, useEffect, useState, createElement } from 'react';
import { categories as baseCategories } from '../data/categories.js';

const STORAGE_KEY = 'ferentino-price-overrides';
export const COMPETITOR_BRANDS = ['FTC', 'CEAT', 'DSI', 'MRF'];
const NUMERIC_FIELDS = ['exVat', 'incVat', ...COMPETITOR_BRANDS];

function rowKey(categoryId, size, pattern) {
  return `${categoryId}|${size}|${pattern}`;
}

function loadOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// ── Context ────────────────────────────────────────────────────────────────────
const PriceStoreContext = createContext(null);

/**
 * Wrap the app once in <PriceStoreProvider> so every page (View AND Admin)
 * shares the same in-memory state. Without this, each page would hold its own
 * useState copy and edits made on Admin wouldn't reflect on View until reload.
 */
export function PriceStoreProvider({ children }) {
  const [overrides, setOverrides] = useState(loadOverrides);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }, [overrides]);

  const setField = useCallback((key, field, value) => {
    setOverrides((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value === '' || value === null ? null : NUMERIC_FIELDS.includes(field) ? Number(value) : value,
      },
    }));
  }, []);

  // Merges base (bundled) data with whatever the admin has edited.
  const getMergedCategories = useCallback(
    () =>
      baseCategories.map((cat) => ({
        ...cat,
        data: {
          ...cat.data,
          groups: cat.data.groups.map((group) => ({
            ...group,
            items: group.items.map((item) => {
              const key = rowKey(cat.id, item.size, item.pattern);
              const ov = overrides[key] || {};
              return {
                ...item,
                rowKey: key,
                exVat: ov.exVat ?? item.exVat,
                incVat: ov.incVat ?? item.incVat,
                discount: ov.discount ?? null,
                FTC: ov.FTC ?? null,
                CEAT: ov.CEAT ?? null,
                DSI: ov.DSI ?? null,
                MRF: ov.MRF ?? null,
              };
            }),
          })),
        },
      })),
    [overrides]
  );

  return createElement(
    PriceStoreContext.Provider,
    { value: { getMergedCategories, setField } },
    children
  );
}

/**
 * Drop-in replacement for the old usePriceStore() hook.
 * Components call this exactly as before — no other changes needed in them.
 */
export function usePriceStore() {
  const ctx = useContext(PriceStoreContext);
  if (!ctx) throw new Error('usePriceStore must be used within PriceStoreProvider');
  return ctx;
}
