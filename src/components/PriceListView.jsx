import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import SubTabs from './SubTabs.jsx';
import Toolbar from './Toolbar.jsx';
import FlatPriceTable from './FlatPriceTable.jsx';
import GroupedPriceTable from './GroupedPriceTable.jsx';
import { usePriceStore } from '../store/usePriceStore.js';

export default function PriceListView({ editable }) {
  const { getMergedCategories, setField, isLoading } = usePriceStore();
  const categories = getMergedCategories();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialGroup = Number(searchParams.get('group'));
  const initialQuery = searchParams.get('query') ?? '';

  const [activeId, setActiveId] = useState(
    categories.some((category) => category.id === initialCategory) ? initialCategory : categories[0]?.id ?? null
  );
  const [activeGroupIndex, setActiveGroupIndex] = useState(Number.isInteger(initialGroup) ? initialGroup : 0);
  const [query, setQuery] = useState(initialQuery);
  const [vatMode, setVatMode] = useState('both');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [compareMode, setCompareMode] = useState(false);

  const active = categories.find((c) => c.id === activeId) ?? categories[0];
  const groups = active?.data.groups ?? [];
  const useSubTabs = active?.subTabs === true;
  const activeGroup = groups[activeGroupIndex] ?? groups[0];

  const handleSelectCategory = (id) => {
    setActiveId(id);
    setActiveGroupIndex(0);
    setQuery('');
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Sub-tab mode searches only the active group's items.
  const filteredGroupItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activeGroup?.items ?? [];
    return (activeGroup?.items ?? []).filter(
      (item) => item.size.toLowerCase().includes(q) || item.pattern.toLowerCase().includes(q)
    );
  }, [activeGroup, query]);

  // Grouped-table mode searches across all of the category's groups.
  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) => item.size.toLowerCase().includes(q) || item.pattern.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  if (isLoading || categories.length === 0) {
    return <main className="flex-1 p-6">Loading price data...</main>;
  }

  const totalCount = useSubTabs
    ? filteredGroupItems.length
    : filteredGroups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
      <Sidebar categories={categories} activeId={activeId} onSelect={handleSelectCategory} />
      <main className="min-w-0 flex-1 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-bold sm:text-2xl">{active.data.label}</h2>
          {editable && (
            <span className="text-xs font-semibold uppercase bg-brand-red text-white px-2 py-1 rounded">
              Admin — editing
            </span>
          )}
        </div>
        <p className="text-sm text-blue-700 mb-4">{active.data.description}</p>

        {useSubTabs && <SubTabs groups={groups} activeIndex={activeGroupIndex} onSelect={setActiveGroupIndex} />}

        <Toolbar
          query={query}
          onQueryChange={setQuery}
          vatMode={vatMode}
          onVatModeChange={setVatMode}
          compareMode={compareMode}
          onCompareModeToggle={() => setCompareMode((v) => !v)}
        />

        <p className="text-xs text-gray-500 mb-2">
          {totalCount} tyre sizes
          {editable && ' — click any cell to edit'}
        </p>

        {useSubTabs ? (
          <FlatPriceTable
            items={filteredGroupItems}
            vatMode={vatMode}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            compareMode={compareMode}
            editable={editable}
            onFieldChange={setField}
          />
        ) : (
          <GroupedPriceTable
            groups={filteredGroups}
            vatMode={vatMode}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            compareMode={compareMode}
            editable={editable}
            onFieldChange={setField}
          />
        )}
      </main>
    </div>
  );
}
