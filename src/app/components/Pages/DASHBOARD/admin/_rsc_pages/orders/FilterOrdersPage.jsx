'use client';
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { ChevronDown, Clock, MoreHorizontal, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { deleteOrder } from '@/lib/actions/orders';

export function FilterOrdersPage({ data = {}, mutateOrders }) {
  const [sorting, setSorting] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const { data: orders = [] } = data;
  const { toast } = useToast(); // show notification

  // handle for order delete
  const handleDeleteOrder = async (id) => {
    try {
      const { success, message } = await deleteOrder(id);

      if (success) {
        toast({ title: message || 'Order deleted successfully.' });
        mutateOrders(); // Refetch updated data
      } else {
        toast({ title: message || 'Failed to delete order.' });
      }
    } catch (error) {
      toast({ title: 'Something went wrong.', variant: 'destructive' });
    }
  };

  // columns
  const columns = [
    {
      accessorKey: 'id',
      header: 'ORDER',
      cell: ({ row }) => <div className="capitalize">{row.getValue('id')}</div>,
    },
    {
      header: 'CUSTOMER NAME',
      accessorFn: (row) => row.user?.name?.toUpperCase() || 'Unknown',
      id: 'customerName',
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-start">
            <Badge
              className={` flex gap-2 items-center justify-center p-2 w-fit  ${item.status === 'pending' && 'bg-amber-100 hover:bg-amber-100 text-amber-500 hover:text-amber-500'} ${
                item.status === 'cancelled' && 'bg-red-100 hover:bg-red-100 text-dangerSecondary hover:text-dangerSecondary '
              } ${item.status === 'confirmed' && 'bg-green-50 hover:bg-green-50 text-secondaryDark hover:text-secondaryDark '}`}
            >
              <Clock size={14} />
              {item.status}
            </Badge>
          </div>
        );
      },
    },
    {
      header: 'ITEM NAME',
      accessorFn: (row) => row.orderable?.name?.toUpperCase() || 'Unknown',
    },
    {
      header: 'ITEM TYPE',
      accessorFn: (row) => row.orderable?.item_type,
      id: 'activityName',
    },
    {
      header: 'TOTAL AMOUNT',
      accessorFn: (row) => `$${Number(row.payment?.total_amount).toLocaleString()}`,
      id: 'totalAmount',
    },
    {
      header: 'EMERGENCY CONTACT',
      accessorFn: (row) => `${row.emergency_contact?.contact_name} (${row.emergency_contact?.relationship})`,
      id: 'emergencyContact',
    },

    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleDeleteOrder(item.id)} className="flex items-center gap-2 px-2 py-2 text-red-600 hover:bg-red-50 cursor-pointer">
                <Trash size={16} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // table instance
  const table = useReactTable({
    data: orders,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4 flex-wrap gap-2">
        <Input
          placeholder="Filter By status..."
          value={table.getColumn('status')?.getFilterValue() ?? ''}
          onChange={(event) => table.getColumn('status')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="capitalize text-grayDark" key={cell.id}>
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-xs  text-gray-600">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      </div>
    </div>
  );
}
