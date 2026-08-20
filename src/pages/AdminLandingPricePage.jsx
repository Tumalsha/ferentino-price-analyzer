import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import SubTabs from '../components/SubTabs.jsx';
import RateConfigPanel from '../components/RateConfigPanel.jsx';
import LandingPriceTable from '../components/LandingPriceTable.jsx';
import { categories as baseCategories } from '../data/categories.js';

export default function AdminLandingPricePage() {
  const [activeId, setActiveId] = useState(baseCategories[0].id);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const active = baseCategories.find((c) => c.id === activeId);
  const useSubTabs = active.subTabs === true;
  const groups = active.data.groups;

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
    <div className="flex flex-1">
      <Sidebar categories={baseCategories} activeId={activeId} onSelect={handleSelectCategory} />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-2xl font-bold">Landing Price Analysis — {active.data.label}</h2>
          <span className="text-xs font-semibold uppercase bg-brand-red text-white px-2 py-1 rounded">Admin</span>
        </div>
        <p className="text-sm text-blue-700 mb-4">
          Enter FTC's dealer price (ex VAT) and each competitor's dealer price (with VAT). Landing price and the
          difference vs FTC are computed automatically from the rates below.
        </p>

        {useSubTabs && <SubTabs groups={groups} activeIndex={activeGroupIndex} onSelect={setActiveGroupIndex} />}

        <RateConfigPanel categoryId={activeId} />
        <LandingPriceTable categoryId={activeId} items={items} />
      </main>
    </div>
  );
}
