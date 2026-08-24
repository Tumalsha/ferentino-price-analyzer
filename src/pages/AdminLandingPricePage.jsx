import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import SubTabs from '../components/SubTabs.jsx';
import RateConfigPanel from '../components/RateConfigPanel.jsx';
import LandingPriceTable from '../components/LandingPriceTable.jsx';
import { useLandingPriceStore } from '../store/useLandingPriceStore.js';
import { usePriceStore } from '../store/usePriceStore.js';
import { computeLanding } from '../utils/landingPrice.js';

export default function AdminLandingPricePage() {
  const { baseCategories, setField, isLoading } = usePriceStore();
  const [activeId, setActiveId] = useState(null);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  const {
    getRateConfig, setStepRate, setFocRatio,
    getRowRateConfig, rowHasOverride, setRowStepRate, setRowFocRatio, resetRowRates,
    getDealerPrice, setDealerPrice,
    dealerPrices, rateOverrides, rowRateOverrides,
  } = useLandingPriceStore();

  useEffect(() => {
    if (baseCategories.length > 0 && !baseCategories.some((category) => category.id === activeId)) {
      setActiveId(baseCategories[0].id);
      setActiveGroupIndex(0);
    }
  }, [activeId, baseCategories]);

  if (isLoading || baseCategories.length === 0) {
    return <main className="flex-1 p-6">Loading price data...</main>;
  }

  const active = baseCategories.find((c) => c.id === activeId) ?? baseCategories[0];
  const useSubTabs = active.subTabs === true;
  const groups = active.data.groups;

  // ── Sync FTC landing → "FTC" compare-price column ──────────────────────────
  // Runs whenever any dealer price or any rate config changes, and covers every
  // category/tyre — not just the currently visible one — so the View and Admin
  // price-list pages always reflect the latest computed landing price.
  useEffect(() => {
    baseCategories.forEach((cat) => {
      cat.data.groups.forEach((group) => {
        group.items.forEach((item) => {
          const rowKey = `${cat.id}|${item.size}|${item.pattern}`;
          const ftcWithVat = dealerPrices[rowKey]?.ftcWithVat ?? null;
          if (ftcWithVat != null) {
            const config = getRowRateConfig(rowKey, cat.id, 'FTC');
            const { landingWithFOC } = computeLanding(ftcWithVat, config);
            if (landingWithFOC != null) {
              setField(rowKey, 'FTC', Math.round(landingWithFOC));
            }
          }

          ['CEAT', 'DSI', 'MRF'].forEach((brand) => {
            const dealerPrice = dealerPrices[rowKey]?.[brand] ?? null;
            if (dealerPrice != null) {
              const config = getRowRateConfig(rowKey, cat.id, brand);
              const { landingWithFOC } = computeLanding(dealerPrice, config);
              if (landingWithFOC != null) {
                setField(rowKey, brand, Math.round(landingWithFOC));
              }
            }
          });
        });
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseCategories, dealerPrices, rateOverrides, rowRateOverrides]);

  const withRowKey = (item) => ({ ...item, rowKey: `${active.id}|${item.size}|${item.pattern}` });

  // Sub-tab categories (currently just Passenger Car Radial) show only the
  // active group's items; everything else stays flattened across all groups,
  // matching how the main price list handles the same split.
  const items = useSubTabs
    ? (groups[activeGroupIndex] ?? groups[0]).items.map(withRowKey)
    : groups.flatMap((group) => group.items.map(withRowKey));

  const handleSelectCategory = (id) => {
    setActiveId(id);
    setActiveGroupIndex(0);
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
      <Sidebar categories={baseCategories} activeId={activeId} onSelect={handleSelectCategory} />
      <main className="min-w-0 flex-1 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <h2 className="text-xl font-bold sm:text-2xl">Landing Price Analysis — {active.data.label}</h2>
          <span className="text-xs font-semibold uppercase bg-brand-red text-white px-2 py-1 rounded">Admin</span>
        </div>
        <p className="text-sm text-blue-700 mb-4">
          Enter FTC's dealer price (with VAT) and each competitor's dealer price (with VAT). Landing price and the
          difference vs FTC are computed automatically from the rates below.
        </p>

        {useSubTabs && <SubTabs groups={groups} activeIndex={activeGroupIndex} onSelect={setActiveGroupIndex} />}

        <RateConfigPanel 
          categoryId={activeId} 
          getRateConfig={getRateConfig} 
          setStepRate={setStepRate} 
          setFocRatio={setFocRatio} 
        />
        <LandingPriceTable 
          categoryId={activeId} 
          items={items} 
          getRateConfig={getRateConfig}
          getRowRateConfig={getRowRateConfig}
          rowHasOverride={rowHasOverride}
          setRowStepRate={setRowStepRate}
          setRowFocRatio={setRowFocRatio}
          resetRowRates={resetRowRates}
          getDealerPrice={getDealerPrice} 
          setDealerPrice={setDealerPrice} 
        />
      </main>
    </div>
  );
}
