'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * TableSkeleton - Placeholder rows shown while a data table loads/paginates.
 *
 * Mirrors the shadcn Table shape used by the dashboard list tables (reviews, add-ons)
 * so the layout holds steady when rows arrive. Used instead of a spinner, especially
 * for pagination page changes.
 *
 * @param {number} columns - Column count to match the real table.
 * @param {number} rows - Placeholder row count (default 6).
 * @param {string[]} headers - Optional header labels; falls back to blank header cells.
 */
export function TableSkeleton({ columns, rows = 6, headers = [] }) {
  return (
    <div className="overflow-hidden rounded-md border" aria-hidden="true">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, col) => (
              <TableHead key={col}>{headers[col] ?? <Skeleton className="h-4 w-16" />}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, row) => (
            <TableRow key={row}>
              {Array.from({ length: columns }).map((_, col) => (
                <TableCell className="p-2 px-4" key={col}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
