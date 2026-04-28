import React from "react";

interface Column<T> {
  key:       string;
  header:    React.ReactNode;
  render?:   (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns:    Column<T>[];
  data:       T[];
  keyField:   keyof T;
  emptyState?: React.ReactNode;
}

/** Tabla genérica con cabecera, filas, hover y empty-state. */
export function DataTable<T>({
  columns,
  data,
  keyField,
  emptyState,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-[10px] text-left text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-[var(--muted)] bg-[var(--bg)] border-b border-[var(--border)] whitespace-nowrap first:pl-5 last:pr-5"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                {emptyState ?? (
                  <div className="flex flex-col items-center gap-3 py-12 text-[var(--muted)] text-sm">
                    <span className="text-3xl">📭</span>
                    Sin resultados
                  </div>
                )}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={String(row[keyField])}
                className="border-b border-[var(--border)] last:border-b-0 hover:bg-[#fafbfc] transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-[13px] text-[0.855rem] text-[var(--text-2)] align-middle first:pl-5 last:pr-5 ${col.className ?? ""}`}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
