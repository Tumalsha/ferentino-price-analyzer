import { Car, Disc, CircleDot, Truck, Container, Bike } from 'lucide-react';

const ICONS = {
  car: Car,
  tire: Disc,
  circle: CircleDot,
  'truck-small': Truck,
  truck: Container,
  bike: Bike,
};

export default function Sidebar({ categories, activeId, onSelect }) {
  return (
    <aside className="w-64 bg-brand-dark text-white flex-shrink-0 py-5">
      <p className="text-xs uppercase tracking-wide text-white/40 px-5 mb-2">Categories</p>
      <nav className="flex flex-col gap-1 px-2">
        {categories.map((cat) => {
          const Icon = ICONS[cat.icon] ?? Disc;
          const active = cat.id === activeId;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-left transition-colors ${
                active ? 'bg-brand-red text-white font-medium' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <Icon size={18} />
              {cat.data.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
