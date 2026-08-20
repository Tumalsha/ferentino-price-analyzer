import { useMemo, useState } from 'react';
import { ArrowRight, BarChart3, Car, CircleDot, Disc3, Search, ShieldCheck, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePriceStore } from '../store/usePriceStore.js';

const CATEGORY_ICONS = {
  car: Car,
  tire: Disc3,
  circle: CircleDot,
  'truck-small': Truck,
  truck: Truck,
  bike: Disc3,
};

export default function Dashboard() {
  const { getMergedCategories } = usePriceStore();
  const navigate = useNavigate();
  const categories = getMergedCategories();
  const [query, setQuery] = useState('');

  const stats = useMemo(() => {
    const groups = categories.flatMap((category) => category.data.groups);
    return {
      categories: categories.length,
      tyres: groups.reduce((total, group) => total + group.items.length, 0),
      groups: groups.length,
    };
  }, [categories]);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return categories.flatMap((category) =>
      category.data.groups.flatMap((group, groupIndex) =>
        group.items
          .filter((item) =>
            [item.size, item.pattern, group.groupLabel, category.data.label]
              .filter(Boolean)
              .some((value) => value.toLowerCase().includes(normalizedQuery))
          )
          .map((item) => ({ ...item, category, group, groupIndex }))
      )
    );
  }, [categories, query]);

  const openResult = (result) => {
    const params = new URLSearchParams({
      category: result.category.id,
      group: String(result.groupIndex),
      query: query.trim(),
    });
    navigate(`/prices?${params.toString()}`);
  };

  return (
    <main className="flex-1 bg-[#0d1117] text-slate-100">
      <section className="border-b border-white/10 bg-[#111821]">
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-12 lg:px-10">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand-red">Ferentino workspace</p>
              <h2 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
                Find the right tyre, then move straight to its price.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">
                Search the full catalogue by tyre size, tread pattern, or category. Your result opens in the live price list.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <ShieldCheck size={18} />
              Catalogue ready
            </div>
          </div>

          <div className="mt-9 max-w-4xl rounded-xl border border-white/10 bg-[#0b1016] p-2 shadow-2xl shadow-black/20">
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#171f2a] px-4 py-4 ring-1 ring-black/20 transition-colors focus-within:border-brand-red/70">
              <Search size={21} className="text-red-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tyre size or tread pattern..."
                aria-label="Search tyre size or tread pattern"
                className="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                autoFocus
              />
              {query && <span className="text-xs font-semibold text-slate-500">{results.length} matches</span>}
            </div>
          </div>

          {query && (
            <div className="mt-4 max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-[#151d27] shadow-2xl shadow-black/20">
              {results.length > 0 ? (
                <div className="divide-y divide-white/10">
                  {results.slice(0, 12).map((result) => (
                    <button
                      key={`${result.category.id}-${result.groupIndex}-${result.size}-${result.pattern}`}
                      onClick={() => openResult(result)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-brand-red/10"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-white">{result.pattern}</span>
                        <span className="mt-1 block text-xs text-slate-400">
                          {result.size} <span className="px-1 text-slate-600">/</span> {result.category.data.label} <span className="px-1 text-slate-600">/</span> {result.group.groupLabel}
                        </span>
                      </span>
                      <ArrowRight size={18} className="shrink-0 text-red-400" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-8 text-sm text-slate-400">No tyres match “{query}”. Try a size or tread name.</div>
              )}
              {results.length > 12 && <p className="border-t border-white/10 px-5 py-3 text-xs text-slate-500">Showing the first 12 matches</p>}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">At a glance</p>
            <h3 className="mt-1 text-xl font-bold text-white">Catalogue overview</h3>
          </div>
          <BarChart3 size={21} className="text-brand-red" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Product families', value: stats.categories },
            { label: 'Tyre patterns', value: stats.tyres },
            { label: 'Catalogue sections', value: stats.groups },
          ].map((stat) => (
            <div key={stat.label} className="border-l-4 border-brand-red bg-[#151d27] px-5 py-5 shadow-xl shadow-black/10 ring-1 ring-white/5">
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.icon] ?? Disc3;
            const count = category.data.groups.reduce((total, group) => total + group.items.length, 0);
            return (
              <button
                key={category.id}
                onClick={() => navigate(`/prices?category=${category.id}`)}
                className="group flex items-center justify-between border border-white/10 bg-[#151d27] p-5 text-left shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-brand-red/70 hover:bg-[#192331] hover:shadow-2xl hover:shadow-black/20"
              >
                <span className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center bg-brand-red/10 text-red-400 ring-1 ring-brand-red/20">
                    <Icon size={22} />
                  </span>
                  <span>
                    <span className="block font-bold text-white">{category.data.label}</span>
                    <span className="mt-1 block text-xs text-slate-400">{count} tyre patterns</span>
                  </span>
                </span>
                <ArrowRight size={18} className="text-slate-600 transition-colors group-hover:text-red-400" />
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}