import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  createElement,
} from "react";
import { categories as localCategories } from "../data/categories.js";

const STORAGE_KEY = "ferentino-price-overrides";
export const COMPETITOR_BRANDS = [
  "FTC",
  "CEAT",
  "DSI",
  "MRF",
  "AKVORA INTERNATIONAL (PVT) LTD",
  "AUTO CAR CARE TRADING (PVT) LTD",
  "BENEDICTSONS PVT LTD",
  "CEAT KELANI INTERNATIONAL TYRES PVT",
  "CEAT KELANI INTERNATIONAL TYRES PVT LTD.",
  "COLOMBO WEST INTERNATIONAL TERMINAL",
  "CROWN TYRES PVT LTD",
  "DAVID PIERIS MOTOR COMPANY (PVT)LTD",
  "DHARMASIRI TYRE HOUSE PVT LTD",
  "DIESEL & MOTOR ENGINEERING PLC",
  "DOUGLAS AND SONS PVT LTD",
  "DOUGLAS AND SONS PVT LTD.",
  "DUTCH LANKA ENGINEERING PVT LTD",
  "HEAVY MACHINERY TYRE POINT",
  "ISLAND GLOBAL IMPORT PVT LTD",
  "JANATHA TYRE INDUSTRIES PVT LTD",
  "LANWA SANSTHA CEMENT CORP.(PVT) LTD",
  "METRO AUTO MART PVT LTD",
  "PERERA TYRE SERVICE PVT LTD",
  "PRIME LANKA TYRES (PVT) LTD",
  "RICHARD PIERIS TYRE CO LTD",
  "ROAD WIN INTERNATIONAL PVT LTD",
  "SAMARASINGHE MOTOR STORES (PVT)LTD",
  "SAMSON RUBBER INDUSTRIES PVT LTD",
  "STEVANS INTERNATIONAL PVT LTD",
  "SUPERGRIP INTERNATIONAL (PVT) LTD",
  "T JAY ENTERPRISES PVT LTD",
  "TARGETONE AUTOMOTIVE PVT LTD",
  "THE TYRE STATION PVT LTD",
  "TOYOTA LANKA (PVT) LTD",
  "TRANSPORTATION SOLUTIONS (PVT) LTD",
  "TVS ATOMOTIVES PVT LTD",
  "TYRE HOUSE TRADING PVT LTD",
  "TYRE LANKA TRADING PVT LTD",
  "TYRE PLAZA LANKA",
  "U & H WHEEL SERVICE PVT LTD",
  "UNIVERSAL TYRE IMPORTS PVT LTD",
  "V - BLAZE LANKA (PVT) LTD",
  "VERTEX HOLDING LANKA (PVT) LTD",
  "WHEELS PVT LTD"
];
const NUMERIC_FIELDS = ["exVat", "incVat", ...COMPETITOR_BRANDS];

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_URL = import.meta.env.DEV
  ? configuredApiUrl || "http://localhost:4000"
  : configuredApiUrl &&
      !/^https?:\/\/localhost(?::|\/|$)/i.test(configuredApiUrl)
    ? configuredApiUrl.replace(/\/$/, "")
    : "";
const API_ENABLED = import.meta.env.PROD || Boolean(API_URL);
const TOKEN_KEY = "ferentino-admin-token";

// Metadata that isn't stored in MongoDB (UI-only concerns).
// The "label" here must exactly match the "category" field on each Tyre document.
const CATEGORY_META = [
  {
    labels: ["Passenger Car Radial", "Eternopresa", "Celestra"],
    id: "passenger-car-radial",
    icon: "car",
    subTabs: true,
  },
  {
    labels: ["Light Commercial (LCV)"],
    id: "lcv",
    icon: "truck-small",
    subTabs: false,
  },
  {
    labels: ["Truck / Light Truck"],
    id: "truck-light-truck",
    icon: "truck",
    subTabs: false,
  },
  {
    labels: ["Two & Three Wheeler"],
    id: "two-three-wheeler",
    icon: "bike",
    subTabs: true,
  },
];

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

// Converts a flat array of tyre documents from the API into the
// { id, icon, subTabs, data: { label, groups: [{ groupLabel, items }] } } shape
// the rest of the app expects.
function buildCategoriesFromTyres(tyres) {
  return CATEGORY_META.map((meta) => {
    const tyresInCategory = tyres.filter((t) =>
      meta.labels.includes(t.category),
    );

    const groupsMap = {};
    for (const tyre of tyresInCategory) {
      if (!groupsMap[tyre.groupLabel]) {
        groupsMap[tyre.groupLabel] = [];
      }
      groupsMap[tyre.groupLabel].push({
        size: tyre.size,
        pattern: tyre.pattern,
        exVat: tyre.exVat,
        incVat: tyre.incVat,
      });
    }

    const groups = Object.keys(groupsMap).map((groupLabel) => ({
      groupLabel,
      items: groupsMap[groupLabel],
    }));

    return {
      id: meta.id,
      icon: meta.icon,
      subTabs: meta.subTabs,
      data: {
        label: meta.labels[0],
        groups,
      },
    };
  });
}

// ── Context ────────────────────────────────────────────────────────────────────
const PriceStoreContext = createContext(null);

export function PriceStoreProvider({ children }) {
  const [overrides, setOverrides] = useState(loadOverrides);
  const [baseCategories, setBaseCategories] = useState(localCategories);
  const [isLoading, setIsLoading] = useState(API_ENABLED);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }, [overrides]);

  useEffect(() => {
    if (!API_ENABLED) return;

    fetch(`${API_URL}/api/tyres`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load tyre data");
        setBaseCategories(buildCategoriesFromTyres(await response.json()));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load tyres from backend:", err);
        setLoadError(err.message);
        setIsLoading(false);
      });

    fetch(`${API_URL}/api/price-overrides`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load price overrides");
        const serverOverrides = await response.json();
        const remote = Object.fromEntries(
          serverOverrides.map(
            ({ rowKey, exVat, incVat, discount, FTC, CEAT, DSI, MRF }) => [
              rowKey,
              { exVat, incVat, discount, FTC, CEAT, DSI, MRF },
            ],
          ),
        );
        setOverrides(remote);
        localStorage.removeItem(STORAGE_KEY);
      })
      .catch((err) => console.error("Failed to load price overrides:", err));
  }, []);

  const setField = useCallback((key, field, value) => {
    const nextValue =
      value === "" || value === null
        ? null
        : NUMERIC_FIELDS.includes(field)
          ? Number(value)
          : value;
    setOverrides((prev) => {
      if (prev[key]?.[field] === nextValue) return prev;
      return {
        ...prev,
        [key]: { ...prev[key], [field]: nextValue },
      };
    });
    const token = sessionStorage.getItem(TOKEN_KEY);
    const [categoryId, size, ...patternParts] = key.split("|");
    if (token && API_ENABLED && categoryId && size && patternParts.length > 0) {
      fetch(`${API_URL}/api/price-overrides/${encodeURIComponent(key)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          field,
          value: nextValue,
          categoryId,
          size,
          pattern: patternParts.join("|"),
        }),
      }).catch((err) => console.error("Failed to save price override:", err));
    }
  }, []);

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
                TEST123: ov.TEST123 ?? null,
              };
            }),
          })),
        },
      })),
    [baseCategories, overrides],
  );

  return createElement(
    PriceStoreContext.Provider,
    {
      value: {
        baseCategories,
        getMergedCategories,
        setField,
        isLoading,
        loadError,
      },
    },
    children,
  );
}

export function usePriceStore() {
  const ctx = useContext(PriceStoreContext);
  if (!ctx)
    throw new Error("usePriceStore must be used within PriceStoreProvider");
  return ctx;
}
