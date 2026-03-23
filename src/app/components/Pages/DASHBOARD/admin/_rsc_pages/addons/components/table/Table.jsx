'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Coins } from 'lucide-react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useIsClient } from '@/hooks/useIsClient';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { SelectableCardCheckbox } from '@/app/components/Checkbox/SelectableCardCheckbox';
import { useEffect } from 'react';
import { StatusBadge, STATUS_TYPES } from '@/app/components/Shared/StatusBadge';
import { TableActions } from '@/app/components/Shared/TableActions';
import { TYPE_ICONS, TYPE_VARIANTS } from '@/app/components/Shared/TypeBadge';

export function AddOnTable({ data = [], onDelete, selectedItems = [], onSelectionChange, addOnsCount = 0, onAllSelectedChange }) {
  const isClient = useIsClient(); // hydration errors

  // Update isAllSelected when individual selections change
  useEffect(() => {
    if (onAllSelectedChange && data.length > 0) {
      const allSelected = data.length > 0 && data.every((addOn) => selectedItems.includes(addOn.id));
      onAllSelectedChange(allSelected);
    }
  }, [selectedItems, data.length, onAllSelectedChange]);

  // Handle individual checkbox change
  const handleSelectionChange = (checked, addOnId) => {
    if (onSelectionChange) {
      const newSelection = checked ? [...selectedItems, addOnId] : selectedItems.filter((id) => id !== addOnId);
      onSelectionChange(newSelection);
    }
  };

  // Columns Structure
  const columns = [
    {
      id: 'select',
      header: () => (
        <Checkbox
          checked={data.length > 0 && selectedItems.length === data.length}
          onCheckedChange={(checked) => {
            if (checked) {
              onSelectionChange(data.map((a) => a.id));
            } else {
              onSelectionChange([]);
            }
          }}
          className="h-5 w-5 rounded border-2 border-[#568f7c] bg-white data-[state=checked]:bg-[#568f7c] data-[state=checked]:text-white data-[state=checked]:border-[#568f7c] [&_svg]:text-white [&_svg]:scale-100 transition-none transform-none"
        />
      ),
      cell: ({ row }) => <SelectableCardCheckbox checked={selectedItems.includes(row.original.id)} onCheckedChange={handleSelectionChange} itemId={row.original.id} />,
    },
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
        const typeLower = type?.toLowerCase();
        const Icon = TYPE_ICONS[typeLower];

        return <StatusBadge status={typeLower} type={STATUS_TYPES.ADDON_TYPE} icon={Icon} />;
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
        const isActive = row?.original?.active_status;
        const status = isActive ? 'active' : 'inactive';
        return <StatusBadge status={status} type={STATUS_TYPES.ADDON} />;
      },
    },
    {
      accessorKey: 'id',
      header: 'Actions',
      cell: ({ row }) => {
        const addOnId = row?.original?.id;
        return <TableActions id={addOnId} editUrl={`/dashboard/admin/addon/${addOnId}`} onDelete={onDelete} />;
      },
    },
  ];

  // table instance
  // eslint-disable-next-line react-hooks/incompatible-library
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
