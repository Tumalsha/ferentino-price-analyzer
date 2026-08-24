import { Fragment, useState } from 'react';
import EditableCell from './EditableCell.jsx';
import { LANDING_BRANDS, DEFAULT_RATE_CONFIG } from '../data/landingPriceDefaults.js';
import { computeLanding } from '../utils/landingPrice.js';

function formatLKR(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return 'LKR ' + Math.round(n).toLocaleString('en-LK');
}

// Inline expandable panel for per-row rate overrides (one mini-card per brand).
function RowRatePanel({ rowKey, categoryId, getRowRateConfig, setRowStepRate, setRowFocRatio, resetRowRates, rowHasOverride }) {
  const totalCols = 4 + LANDING_BRANDS.length * 3; // matches table colspan

  return (
    <tr className="bg-blue-50 border-t border-blue-100">
      <td colSpan={totalCols} className="px-3 py-3">
        <div className="flex items-start gap-2 flex-wrap">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1">
            {Object.keys(DEFAULT_RATE_CONFIG).map((brand) => {
              const config = getRowRateConfig(rowKey, categoryId, brand);
              const hasOverride = rowHasOverride(rowKey, brand);
              return (
                <div
                  key={brand}
                  className={`border rounded-lg p-2 bg-white text-xs ${hasOverride ? 'border-blue-400' : 'border-gray-200'}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold uppercase text-brand-red">{brand}</span>
                    {hasOverride && (
                      <span className="text-blue-600 font-semibold text-[10px] bg-blue-100 px-1 rounded">custom</span>
                    )}
                  </div>
                  {config.steps.map((step) => (
                    <div key={step.key} className="flex items-center justify-between mb-1">
                      <span className="text-gray-500">{step.label}</span>
                      <div className="flex items-center gap-0.5">
                        <input
                          type="number"
                          step="0.01"
                          value={(step.rate * 100).toFixed(2)}
                          onChange={(e) =>
                            setRowStepRate(rowKey, categoryId, brand, step.key, Number(e.target.value) / 100)
                          }
                          className="w-14 border border-gray-300 rounded px-1 py-0.5 text-right"
                        />
                        <span className="text-gray-400">%</span>
                      </div>
                    </div>
                  ))}
                  {config.calcMode === 'flat' && (
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-100">
                      <span className="text-gray-500">FOC (n:1)</span>
                      <input
                        type="number"
                        value={config.focRatio ?? ''}
                        onChange={(e) => setRowFocRatio(rowKey, categoryId, brand, e.target.value)}
                        className="w-14 border border-gray-300 rounded px-1 py-0.5 text-right"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button
            onClick={() => resetRowRates(rowKey)}
            className="text-[11px] text-gray-400 hover:text-red-500 transition-colors self-start mt-1 whitespace-nowrap"
            title="Reset this tyre's rates to category defaults"
          >
            Reset to defaults
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function LandingPriceTable({
  categoryId,
  items,
  getRateConfig,
  getRowRateConfig,
  rowHasOverride,
  setRowStepRate,
  setRowFocRatio,
  resetRowRates,
  getDealerPrice,
  setDealerPrice,
}) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (rowKey) =>
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(rowKey) ? next.delete(rowKey) : next.add(rowKey);
      return next;
    });

  const ftcConfig = getRowRateConfig; // resolved per-row below

  return (
    <div className="border border-gray-200 rounded-lg overflow-x-auto">
      <table className="w-full min-w-[1180px] text-sm">
        <thead className="bg-brand-red text-white">
          <tr>
            <th rowSpan={2} className="text-left px-3 py-3 align-bottom w-6"></th>
            <th rowSpan={2} className="text-left px-3 py-3 align-bottom">Tyre Size</th>
            <th rowSpan={2} className="text-left px-3 py-3 align-bottom">Tread Pattern</th>
            <th rowSpan={2} className="text-right px-3 py-3 align-bottom">FTC Dealer<br/>(With VAT)</th>
            <th rowSpan={2} className="text-right px-3 py-3 align-bottom">FTC<br/>Landing</th>
            {LANDING_BRANDS.map((brand) => (
              <th key={brand} colSpan={3} className="text-center px-3 py-2 border-l border-white/30">{brand}</th>
            ))}
          </tr>
          <tr className="bg-brand-redDark text-white text-xs">
            {LANDING_BRANDS.map((brand) => (
              <Fragment key={brand}>
                <th className="text-right px-2 py-1 border-l border-white/20 font-normal">Dealer (VAT)</th>
                <th className="text-right px-2 py-1 font-normal">Landing</th>
                <th className="text-right px-2 py-1 font-normal">Diff vs FTC</th>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((row) => {
            const isExpanded = expandedRows.has(row.rowKey);
            const rowFtcConfig = getRowRateConfig(row.rowKey, categoryId, 'FTC');
            const ftcWithVat = getDealerPrice(row.rowKey, 'ftcWithVat');
            const ftcLanding = computeLanding(ftcWithVat, rowFtcConfig).landingWithFOC;

            // Does this row have any per-tyre rate customisation?
            const anyOverride = ['FTC', ...LANDING_BRANDS].some((b) => rowHasOverride(row.rowKey, b));

            return (
              <Fragment key={row.rowKey}>
                <tr className={`border-t border-gray-100 hover:bg-gray-50 ${isExpanded ? 'bg-blue-50' : ''}`}>
                  {/* Expand toggle */}
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => toggleRow(row.rowKey)}
                      title={isExpanded ? 'Hide per-tyre rates' : 'Edit rates for this tyre'}
                      className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                        anyOverride
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'text-gray-400 hover:text-brand-red hover:bg-gray-100'
                      }`}
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  </td>
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{row.size}</td>
                  <td className="px-3 py-2 text-blue-700">{row.pattern}</td>
                  <td className="px-1 py-1">
                    <EditableCell value={ftcWithVat} editable onChange={(v) => setDealerPrice(row.rowKey, 'ftcWithVat', v)} />
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-brand-redDark whitespace-nowrap">
                    {formatLKR(ftcLanding)}
                  </td>
                  {LANDING_BRANDS.map((brand) => {
                    const dealerWithVat = getDealerPrice(row.rowKey, brand);
                    const config = getRowRateConfig(row.rowKey, categoryId, brand);
                    const { landingWithFOC } = computeLanding(dealerWithVat, config);
                    const diff = ftcLanding != null && landingWithFOC != null ? ftcLanding - landingWithFOC : null;
                    const diffClass = diff == null ? 'text-gray-400' : diff > 0 ? 'text-red-600' : 'text-green-700';

                    return (
                      <Fragment key={brand}>
                        <td className="px-1 py-1 border-l border-gray-100">
                          <EditableCell
                            value={dealerWithVat}
                            editable
                            onChange={(v) => setDealerPrice(row.rowKey, brand, v)}
                          />
                        </td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">{formatLKR(landingWithFOC)}</td>
                        <td className={`px-3 py-2 text-right font-semibold whitespace-nowrap ${diffClass}`}>
                          {diff == null ? '—' : (diff > 0 ? '+' : '') + formatLKR(diff)}
                        </td>
                      </Fragment>
                    );
                  })}
                </tr>

                {/* Expandable per-tyre rate editor */}
                {isExpanded && (
                  <RowRatePanel
                    rowKey={row.rowKey}
                    categoryId={categoryId}
                    getRowRateConfig={getRowRateConfig}
                    setRowStepRate={setRowStepRate}
                    setRowFocRatio={setRowFocRatio}
                    resetRowRates={resetRowRates}
                    rowHasOverride={rowHasOverride}
                  />
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
