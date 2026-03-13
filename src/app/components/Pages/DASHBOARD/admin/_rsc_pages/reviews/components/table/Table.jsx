'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { StatusBadge } from '@/app/components/Shared/StatusBadge';
import { STATUS_TYPES } from '@/app/components/Shared/constants/statusConfig';
import { TableActions } from '@/app/components/Shared/TableActions';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useIsClient } from '@/hooks/useIsClient';
import { Checkbox } from '@/components/ui/checkbox';
import { SelectableCardCheckbox } from '@/app/components/Checkbox/SelectableCardCheckbox';
import { useEffect } from 'react';

export function ReviewTable({
  reviews = [],
  onDelete,
  selectedItems = [],
  onSelectionChange,
  reviewsCount = 0,
  onAllSelectedChange
}) {
  const isClient = useIsClient(); // hydration errors

  // Update isAllSelected when individual selections change
  useEffect(() => {
    if (onAllSelectedChange && reviews.length > 0) {
      const allSelected = reviews.length > 0 && reviews.every(review => selectedItems.includes(review.id));
      onAllSelectedChange(allSelected);
    }
  }, [selectedItems, reviews.length, onAllSelectedChange]);

  // Handle individual checkbox change
  const handleSelectionChange = (checked, reviewId) => {
    if (onSelectionChange) {
      const newSelection = checked
        ? [...selectedItems, reviewId]
        : selectedItems.filter(id => id !== reviewId);
      onSelectionChange(newSelection);
    }
  };

  // Columns Structure
  const columns = [
    {
      id: 'select',
      header: () => (
        <Checkbox
          checked={reviews.length > 0 && selectedItems.length === reviews.length}
          onCheckedChange={(checked) => {
            if (checked) {
              onSelectionChange(reviews.map(r => r.id));
            } else {
              onSelectionChange([]);
            }
          }}
          className="h-5 w-5 rounded border-2 border-[#568f7c] bg-white data-[state=checked]:bg-[#568f7c] data-[state=checked]:text-white data-[state=checked]:border-[#568f7c] [&_svg]:text-white [&_svg]:scale-100 transition-none transform-none"
        />
      ),
      cell: ({ row }) => (
        <SelectableCardCheckbox
          checked={selectedItems.includes(row.original.id)}
          onCheckedChange={handleSelectionChange}
          itemId={row.original.id}
        />
      ),
    },
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
            <div className="flex"> {ratings && [...Array(ratings)].map((_, index) => <Star key={index} size={16} className="fill-yellow-600 stroke-yellow-600" />)}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return <StatusBadge status={status} type={STATUS_TYPES.REVIEW} />;
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
          <TableActions
            id={reviewId}
            editUrl={`/dashboard/admin/reviews/${reviewId}`}
            onDelete={onDelete}
          />
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
