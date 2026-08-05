'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { ChevronDown, RotateCcw, Trash2 } from 'lucide-react';

import { TypeBadge } from '@/app/components/Shared/TypeBadge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { deleteOrder, permanentlyDeleteOrder, restoreOrder, updateOrderStatus } from '@/lib/actions/orders';

const EMPTY_ORDERS = [];
const ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];

export function FilterOrdersPage({ data = {}, view = 'active', search = '', onSearchChange, onOrdersChanged }) {
  const [sorting, setSorting] = useState('');
  const [searchValue, setSearchValue] = useState(search);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [pendingAction, setPendingAction] = useState(null);
  const [isMutating, setIsMutating] = useState(false);

  const orders = Array.isArray(data.data) ? data.data : EMPTY_ORDERS;
  const { toast } = useToast(); // show notification

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = searchValue.trim();

      if (nextSearch !== search) {
        onSearchChange?.(nextSearch);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [onSearchChange, search, searchValue]);

  const runOrderAction = useCallback(
    async (action, fallback) => {
      setIsMutating(true);

      try {
        const result = await action();

        if (!result.success) {
          toast({ title: result.message || 'Order action failed.', variant: 'destructive' });
          return;
        }

        toast({ title: result.message || fallback });
        setPendingAction(null);
        await onOrdersChanged?.();
      } catch (error) {
        toast({ title: error?.message || 'Order action failed.', variant: 'destructive' });
      } finally {
        setIsMutating(false);
      }
    },
    [onOrdersChanged, toast],
  );

  const handleRestoreOrder = useCallback((id) => runOrderAction(() => restoreOrder(id), 'Order restored successfully.'), [runOrderAction]);

  const handleConfirmAction = () => {
    if (!pendingAction) return;

    if (pendingAction.type === 'force') {
      return runOrderAction(() => permanentlyDeleteOrder(pendingAction.order.id), 'Order permanently deleted.');
    }

    return runOrderAction(() => deleteOrder(pendingAction.order.id), 'Order moved to Trash.');
  };

  // handle for order status update
  const handleStatusChange = useCallback(
    async (id, newStatus) => {
      try {
        const { success, message } = await updateOrderStatus(id, newStatus);

        if (success) {
          toast({ title: message || 'Order status updated successfully.' });
          await onOrdersChanged?.();
        } else {
          toast({ title: message || 'Failed to update order status.', variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'Something went wrong.', variant: 'destructive' });
      }
    },
    [onOrdersChanged, toast],
  );

  // columns
  const columns = useMemo(
    () => [
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

          if (view === 'trash') {
            return <span className="capitalize">{item.status}</span>;
          }

          return (
            <div className="flex justify-start">
              <Select value={item.status} onValueChange={(newStatus) => handleStatusChange(item.id, newStatus)}>
                <SelectTrigger className="h-8 w-[140px] capitalize">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        cell: ({ row }) => {
          const itemType = row.original.orderable?.item_type;
          if (!itemType) return 'Unknown';
          return <TypeBadge type={itemType} />;
        },
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
        header: 'ACTIONS',
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;

          if (view === 'trash') {
            return (
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" disabled={isMutating} aria-label={`Restore order ${item.id}`} onClick={() => handleRestoreOrder(item.id)}>
                  <RotateCcw className="h-4 w-4" />
                  Restore
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isMutating}
                  aria-label={`Delete order ${item.id} permanently`}
                  onClick={() => setPendingAction({ type: 'force', order: item })}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete permanently
                </Button>
              </div>
            );
          }

          return (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isMutating}
              aria-label={`Move order ${item.id} to Trash`}
              onClick={() => setPendingAction({ type: 'trash', order: item })}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          );
        },
      },
    ],
    [handleRestoreOrder, handleStatusChange, isMutating, view],
  );

  // table instance
  const table = useReactTable({
    data: orders,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4 flex-wrap gap-2">
        <Input
          type="search"
          aria-label="Search orders by order number, customer, or item"
          placeholder="Search by order number, customer, or item"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
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
                    <TableCell className="capitalize text-muted-foreground" key={cell.id}>
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
        <div className="text-xs  text-copy">
          {table.getSelectedRowModel().rows.length} of {table.getRowModel().rows.length} row(s) selected.
        </div>
      </div>

      <AlertDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open && !isMutating) setPendingAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingAction?.type === 'force' ? 'Delete order permanently?' : 'Move order to Trash?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === 'force' ? 'This permanently deletes the order and cannot be undone.' : 'The order will move to Trash, where it can be restored later.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isMutating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmAction();
              }}
            >
              {pendingAction?.type === 'force' ? 'Delete permanently' : 'Move to Trash'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
