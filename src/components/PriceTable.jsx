import { Fragment } from "react";
import { ArrowUpDown } from "lucide-react";
import EditableCell from "./EditableCell.jsx";
import { COMPETITOR_BRANDS } from "../store/usePriceStore.js";

export default function PriceTable({
  groups,
  vatMode,
  sortKey,
  sortDir,
  onSort,
  compareMode,
  editable,
  onFieldChange, // (rowKey, field, value) => void — only used when editable
}) {
  const showEx = vatMode === "both" || vatMode === "exVat";
  const showInc = vatMode === "both" || vatMode === "incVat";

  const baseCols = 2 + (showEx ? 1 : 0) + (showInc ? 1 : 0); // size, pattern + vat cols
  const totalCols = baseCols + (compareMode ? COMPETITOR_BRANDS.length : 0);

  const sortRows = (items) => {
    if (!sortKey) return items;
    return [...items].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "string" ? av.localeCompare(bv) : av - bv;
      return sortDir === "asc" ? cmp : -cmp;
    });
  };

  const SortHeader = ({ label, sortField }) => (
    <button
      onClick={() => onSort(sortField)}
      className="flex w-full items-center justify-center gap-1 text-xs font-semibold uppercase tracking-wide"
    >
      {label} <ArrowUpDown size={12} />
    </button>
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-x-auto">
      <table className="w-full min-w-[980px] text-sm">
        <thead className="bg-brand-red text-white">
          <tr>
            <th className="text-center px-4 py-3">
              <SortHeader label="Tyre Size" sortField="size" />
            </th>
            <th className="text-center px-4 py-3">
              <SortHeader label="Tread Pattern" sortField="pattern" />
            </th>
            {showEx && (
              <th className="text-center px-4 py-3">Price Without VAT</th>
            )}
            {showInc && (
              <th className="text-center px-4 py-3">Price With VAT</th>
            )}
            {compareMode &&
              COMPETITOR_BRANDS.map((brand) => (
                <th key={brand} className="text-center px-3 py-3">
                  {brand}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.groupLabel ?? "default"}>
              {group.groupLabel && groups.length > 1 && (
                <tr key={group.groupLabel + "-header"} className="bg-yellow-50">
                  <td
                    colSpan={totalCols}
                    className="px-4 py-2 font-semibold text-brand-redDark text-xs uppercase"
                  >
                    {group.groupLabel}
                  </td>
                </tr>
              )}
              {sortRows(group.items).map((row) => {
                const competitorValues = compareMode
                  ? COMPETITOR_BRANDS.map((brand) => row[brand]).filter(
                      (v) => v != null,
                    )
                  : [];
                const lowest = compareMode
                  ? Math.min(row.incVat, ...competitorValues)
                  : null;

                return (
                  <tr
                    key={row.rowKey}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">{row.size}</td>
                    <td className="px-4 py-3 text-blue-700">{row.pattern}</td>
                    {showEx && (
                      <td className="px-1 py-1">
                        <EditableCell
                          value={row.exVat}
                          editable={editable}
                          onChange={(v) =>
                            onFieldChange(row.rowKey, "exVat", v)
                          }
                        />
                      </td>
                    )}
                    {showInc && (
                      <td className="px-1 py-1">
                        <EditableCell
                          value={row.incVat}
                          editable={editable}
                          isLowest={compareMode && row.incVat === lowest}
                          onChange={(v) =>
                            onFieldChange(row.rowKey, "incVat", v)
                          }
                        />
                      </td>
                    )}
                    {compareMode &&
                      COMPETITOR_BRANDS.map((brand) => (
                        <td key={brand} className="px-1 py-1">
                          <EditableCell
                            value={row[brand]}
                            editable={editable}
                            isLowest={
                              row[brand] != null && row[brand] === lowest
                            }
                            onChange={(v) =>
                              onFieldChange(row.rowKey, brand, v)
                            }
                          />
                        </td>
                      ))}
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
