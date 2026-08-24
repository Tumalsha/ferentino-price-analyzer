import { Search, GitCompare } from 'lucide-react';

export default function Toolbar({ query, onQueryChange, vatMode, onVatModeChange, compareMode, onCompareModeToggle }) {
  return (
    <div className="flex flex-col items-stretch gap-3 mb-4 lg:flex-row lg:items-center lg:gap-4">
      <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 bg-white">
        <Search size={16} className="text-gray-400" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search tyre size or tread pattern..."
          className="w-full outline-none text-sm"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-gray-500 text-xs uppercase font-semibold">Prices</span>
        <div className="flex max-w-full overflow-x-auto bg-gray-100 rounded-md p-1">
          {[
            { key: 'both', label: 'Both' },
            { key: 'incVat', label: 'With VAT' },
            { key: 'exVat', label: 'Without VAT' },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => onVatModeChange(opt.key)}
              className={`shrink-0 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                vatMode === opt.key ? 'bg-brand-red text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={onCompareModeToggle}
        className={`flex w-full items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors lg:w-auto ${
          compareMode ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <GitCompare size={16} />
        Compare Prices
      </button>
    </div>
  );
}
