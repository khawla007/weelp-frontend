'use client';

import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePathname } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { SelectableCardCheckbox } from '@/app/components/Checkbox/SelectableCardCheckbox';
import { useEffect } from 'react';
import { StatusBadge, STATUS_TYPES } from '@/app/components/Shared/StatusBadge';
import { TableActions } from '@/app/components/Shared/TableActions';

export function UserDataTable({ data, selectedItems = [], onSelectionChange, usersCount = 0, onAllSelectedChange, onDelete }) {
  const pathname = usePathname();

  // Update isAllSelected when individual selections change
  useEffect(() => {
    if (onAllSelectedChange && data.length > 0) {
      const allSelected = data.length > 0 && data.every((user) => selectedItems.includes(user.id));
      onAllSelectedChange(allSelected);
    }
  }, [selectedItems, data.length, onAllSelectedChange]);

  // Handle individual checkbox change
  const handleSelectionChange = (checked, userId) => {
    if (onSelectionChange) {
      const newSelection = checked ? [...selectedItems, userId] : selectedItems.filter((id) => id !== userId);
      onSelectionChange(newSelection);
    }
  };

  // columns of users
  const columns = [
    {
      id: 'select',
      header: () => (
        <Checkbox
          checked={data.length > 0 && selectedItems.length === data.length}
          onCheckedChange={(checked) => {
            if (checked) {
              onSelectionChange(data.map((user) => user.id));
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
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} type={STATUS_TYPES.USER} />,
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Role',
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      enableHiding: false,
      cell: ({ row }) => {
        const userId = row.original.id;
        return <TableActions id={userId} editUrl={`${pathname}/${userId}`} onDelete={onDelete} />;
      },
    },
  ];

  // table instance for user
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className="rounded-md border">
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className={'capitalize'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className={'[&:nth-child(3)]:lowercase'} key={cell.id}>
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
    </div>
  );
}
