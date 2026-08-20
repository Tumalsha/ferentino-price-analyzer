import { Fragment } from 'react';
import EditableCell from './EditableCell.jsx';
import { useLandingPriceStore } from '../store/useLandingPriceStore.js';
import { LANDING_BRANDS, VAT_RATE } from '../data/landingPriceDefaults.js';
import { computeLanding } from '../utils/landingPrice.js';

function formatLKR(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return 'LKR ' + Math.round(n).toLocaleString('en-LK');
}

export default function LandingPriceTable({ categoryId, items }) {
  const { getRateConfig, getDealerPrice, setDealerPrice } = useLandingPriceStore();
  const ftcConfig = getRateConfig(categoryId, 'FTC');

  return (
    <div className="border border-gray-200 rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-brand-red text-white">
          <tr>
            <th rowSpan={2} className="text-left px-3 py-3 align-bottom">Tyre Size</th>
            <th rowSpan={2} className="text-left px-3 py-3 align-bottom">Tread Pattern</th>
            <th rowSpan={2} className="text-right px-3 py-3 align-bottom">FTC Dealer<br/>(Ex VAT)</th>
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
            const ftcExVat = getDealerPrice(row.rowKey, 'ftcExVat');
            const ftcWithVat = ftcExVat != null ? ftcExVat * (1 + VAT_RATE) : null;
            const ftcLanding = computeLanding(ftcWithVat, ftcConfig).landingWithFOC;

            return (
              <tr key={row.rowKey} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 font-medium whitespace-nowrap">{row.size}</td>
                <td className="px-3 py-2 text-blue-700">{row.pattern}</td>
                <td className="px-1 py-1">
                  <EditableCell value={ftcExVat} editable onChange={(v) => setDealerPrice(row.rowKey, 'ftcExVat', v)} />
                </td>
                <td className="px-3 py-2 text-right font-semibold text-brand-redDark whitespace-nowrap">
                  {formatLKR(ftcLanding)}
                </td>
                {LANDING_BRANDS.map((brand) => {
                  const dealerWithVat = getDealerPrice(row.rowKey, brand);
                  const config = getRateConfig(categoryId, brand);
                  const { landingWithFOC } = computeLanding(dealerWithVat, config);
                  const diff = ftcLanding != null && landingWithFOC != null ? ftcLanding - landingWithFOC : null;
                  // Positive diff = FTC's landing costs MORE than this competitor's — flagged red.
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
