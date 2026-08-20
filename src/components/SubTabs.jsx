export default function SubTabs({ groups, activeIndex, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-2">
      {groups.map((group, idx) => {
        const isActive = idx === activeIndex;
        return (
          <button
            key={group.groupLabel ?? idx}
            onClick={() => onSelect(idx)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
              isActive
                ? 'bg-brand-red text-white border-b-2 border-brand-red'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {group.groupLabel}
          </button>
        );
      })}
    </div>
  );
}
