'use client';
import { type ReactNode } from 'react';

interface Column<T> { key: keyof T | string; label: string; align?: 'left' | 'right' | 'center'; render?: (row: T) => ReactNode; }

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyField?: keyof T;
  emptyState?: ReactNode;
}

export default function Table<T extends Record<string, any>>({ columns, rows, keyField = 'id' as keyof T, emptyState }: TableProps<T>) {
  return (
    <div className="card p-0 overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F7F7FB]">
            {columns.map(col => (
              <th
                key={String(col.key)}
                className={`px-5 py-3.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap text-${col.align ?? 'left'}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-5 py-16 text-center">
                {emptyState ?? (
                  <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-rounded text-[40px] text-[#D1D5DB]">inbox</span>
                    <p className="text-sm text-[#6B7280]">Nothing here yet</p>
                  </div>
                )}
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={String(row[keyField] ?? i)} className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAFA] transition-colors">
              {columns.map(col => (
                <td
                  key={String(col.key)}
                  className={`px-5 py-[18px] text-sm text-[#1D1D1D] tabular-nums text-${col.align ?? 'left'}`}
                >
                  {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
