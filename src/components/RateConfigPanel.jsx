import { DEFAULT_RATE_CONFIG } from '../data/landingPriceDefaults.js';

export default function RateConfigPanel({ categoryId, getRateConfig, setStepRate, setFocRatio }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Default Rates — applies to all tyres in this category unless overridden per tyre (▼ button on each row)
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Object.keys(DEFAULT_RATE_CONFIG).map((brand) => {
        const config = getRateConfig(categoryId, brand);
        return (
          <div key={brand} className="border border-gray-200 rounded-lg p-3 bg-white">
            <p className="text-xs font-bold uppercase text-brand-red mb-2">{brand}</p>
            {config.steps.map((step) => (
              <div key={step.key} className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-600">{step.label}</span>
                <div className="flex items-center gap-0.5">
                  <input
                    type="number"
                    step="0.01"
                    value={(step.rate * 100).toFixed(2)}
                    onChange={(e) => setStepRate(categoryId, brand, step.key, Number(e.target.value) / 100)}
                    className="w-14 border border-gray-300 rounded px-1 py-0.5 text-right"
                  />
                  <span className="text-gray-400">%</span>
                </div>
              </div>
            ))}
            {config.calcMode === 'flat' && (
              <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-gray-100">
                <span className="text-gray-600">FOC ratio (n:1)</span>
                <input
                  type="number"
                  value={config.focRatio ?? ''}
                  onChange={(e) => setFocRatio(categoryId, brand, e.target.value)}
                  className="w-14 border border-gray-300 rounded px-1 py-0.5 text-right"
                />
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
