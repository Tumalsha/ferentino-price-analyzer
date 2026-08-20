import { useMemo, useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Toolbar from './Toolbar.jsx';
import PriceTable from './PriceTable.jsx';
import { usePriceStore } from '../store/usePriceStore.js';

export default function PriceListView({ editable }) {
  const { getMergedCategories, setField } = usePriceStore();
  const categories = getMergedCategories();

  const [activeId, setActiveId] = useState(categories[0].id);
  const [query, setQuery] = useState('');
  const [vatMode, setVatMode] = useState('both');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [compareMode, setCompareMode] = useState(false);

  const active = categories.find((c) => c.id === activeId);

  const handleSelect = (id) => {
    setActiveId(id);
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

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return active.data.groups;
    return active.data.groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) => item.size.toLowerCase().includes(q) || item.pattern.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [active, query]);

  const totalCount = filteredGroups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="flex flex-1">
      <Sidebar categories={categories} activeId={activeId} onSelect={handleSelect} />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-2xl font-bold">{active.data.label}</h2>
          {editable && (
            <span className="text-xs font-semibold uppercase bg-brand-red text-white px-2 py-1 rounded">
              Admin — editing
            </span>
          )}
        </div>
        <p className="text-sm text-blue-700 mb-4">{active.data.description}</p>

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

        <PriceTable
          groups={filteredGroups}
          vatMode={vatMode}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          compareMode={compareMode}
          editable={editable}
          onFieldChange={setField}
        />
      </main>
    </div>
  );
}
