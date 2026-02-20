'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRightLeft, Coins, Edit, LucideBox, LucideMap, LucideRoute, Star, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useIsClient } from '@/hooks/useIsClient';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function AddOnTable({ data = [], onDelete }) {
  const isClient = useIsClient(); // hydration errors

  // Columns Structure
  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const name = row?.original?.name;
        const description = row?.original?.description;
        return (
          <div className="flex flex-col">
            {name && (
              <CardTitle aschild="true">
                {' '}
                <span className="text-nowrap text-base">{name}</span>
              </CardTitle>
            )}

            {description && (
              <CardDescription aschild="true">
                {' '}
                <span className="text-nowrap text-sm">{description}</span>
              </CardDescription>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row?.original?.type;
        return (
          <div className="capitalize">
            {type === 'itinerary' && (
              <Badge className="text-xs gap-2" variant="success">
                <LucideRoute size={16} />
                {type}
              </Badge>
            )}
            {type === 'activity' && (
              <Badge className="text-xs gap-2" variant="warning">
                <LucideMap size={16} />
                {type}
              </Badge>
            )}
            {type === 'transfer' && (
              <Badge className="text-xs gap-2" variant="outline">
                <ArrowRightLeft size={16} />
                {type}
              </Badge>
            )}

            {type === 'package' && (
              <Badge className="text-xs gap-2" variant="destructive">
                <LucideBox size={16} />
                {type}
              </Badge>
            )}
            {!['itinerary', 'activity', 'transfer', 'package'].includes(type) && <Badge variant="default">{type}</Badge>}
          </div>
        );
      },
    },

    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const price = row?.original?.price; // get user from row data
        return (
          <span className="font-bold flex gap-2">
            <Coins size={16} /> {price}
          </span>
        );
      },
    },

    {
      accessorKey: 'active_status',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row?.original?.active_status; // get user from row data
        return (
          <span>
            {isActive && <Badge variant="success">Active</Badge>}

            {!isActive && <Badge variant="destructive">In Active</Badge>}
          </span>
        );
      },
    },
    {
      accessorKey: 'id',
      header: 'Actions',
      cell: ({ row }) => {
        const addOnId = row?.original?.id;
        return (
          <div className="flex gap-4">
            <Link aschild={'true'} href={`/dashboard/admin/addon/${addOnId}`}>
              <Edit size={16} />
            </Link>
            <Trash2
              onClick={() => {
                onDelete(addOnId);
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
    data,
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

                  {/* {<Input type="checkbox" />} */}
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
