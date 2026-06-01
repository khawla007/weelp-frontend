'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * TableSkeleton - Placeholder rows shown while a data table loads/paginates.
 *
 * Mirrors the shadcn Table shape used by the dashboard list tables (reviews, add-ons)
 * so the layout holds steady when rows arrive. Used instead of a spinner, especially
 * for pagination page changes.
 *
 * Pass `title` (and optionally `description`) when the real table is wrapped in a Card
 * with a header — e.g. the taxonomy index tables. The skeleton then mirrors that Card
 * shell so the loading state matches the loaded layout. Omit them for tables rendered
 * in a bare bordered container (users, transfer zones/routes).
 *
 * @param {number} columns - Column count to match the real table.
 * @param {number} rows - Placeholder row count (default 6).
 * @param {string[]} headers - Optional header labels; falls back to blank header cells.
 * @param {string} title - Optional Card title; when set, wraps the table in a Card header/content.
 * @param {string} description - Optional Card description shown under the title.
 */
export function TableSkeleton({ columns, rows = 6, headers = [], title, description }) {
  const table = (
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
  );

  if (title) {
    return (
      <Card aria-hidden="true">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent>{table}</CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border" aria-hidden="true">
      {table}
    </div>
  );
}
