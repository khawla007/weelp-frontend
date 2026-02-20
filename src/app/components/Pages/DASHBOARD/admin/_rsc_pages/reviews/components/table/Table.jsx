'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Star, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useIsClient } from '@/hooks/useIsClient';

export function ReviewTable({ reviews = [], onDelete }) {
  const isClient = useIsClient(); // hydration errors

  // Columns Structure
  const columns = [
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => {
        const created_date = row?.original?.created_at;
        return <span className="text-nowrap">{created_date}</span>;
      },
    },
    {
      accessorKey: 'user',
      header: 'Customer',
      cell: ({ row }) => {
        const user = row.original.user; // get user from row data
        return (
          <div>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span>{user?.name || 'Unknown User'}</span>
                <span>{user?.email || 'test@test.com'}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'rating',
      header: 'Ratings',
      cell: ({ row }) => {
        const ratings = row.original.rating; // get user from row data
        return (
          <div>
            <div className="flex"> {ratings && [...Array(ratings)].map((_, index) => <Star key={index} size={16} className="fill-yellow-400 stroke-yellow-400" />)}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div className="capitalize">
            {status === 'approved' && <Badge variant="success">{status}</Badge>}
            {status === 'pending' && <Badge variant="warning">{status}</Badge>}
            {!['approved', 'pending'].includes(status) && <Badge variant="default">{status}</Badge>}
          </div>
        );
      },
    },
    {
      accessorKey: 'review_text',
      header: 'Review',
    },
    {
      accessorKey: 'id',
      header: 'Actions',
      cell: ({ row }) => {
        const reviewId = row?.original?.id;
        return (
          <div className="flex gap-4">
            <Link aschild={'true'} href={`/dashboard/admin/reviews/${reviewId}`}>
              <Edit size={16} />
            </Link>
            <Trash2
              onClick={() => {
                onDelete(reviewId);
              }}
              size={16}
              className="text-red-400 cursor-pointer"
            />
          </div>
        );
      },
    },
  ];

  // table instance
  const table = useReactTable({
    data: reviews,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isClient) {
    return (
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>;
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="p-2 px-4" key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }
}
