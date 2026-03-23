'use client';

import { useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/app/components/Shared/StatusBadge';
import { TableActions } from '@/app/components/Shared/TableActions';
import { STATUS_TYPES } from '@/app/components/Shared/constants/statusConfig';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteCategory } from '@/lib/actions/categories';
import { Checkbox } from '@/components/ui/checkbox';
import { SelectableCardCheckbox } from '@/app/components/Checkbox/SelectableCardCheckbox';

export function DataTableCategory({ categories = [], mutate, selectedItems = [], onSelectionChange, categoriesCount, onAllSelectedChange }) {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Sync isAllSelected with parent state
  useEffect(() => {
    if (selectedItems.length === categoriesCount && categoriesCount > 0) {
      setIsAllSelected(true);
    } else {
      setIsAllSelected(false);
    }
  }, [selectedItems, categoriesCount]);

  // Handle selection change
  const handleSelectionChange = (checked, itemId) => {
    if (checked) {
      onSelectionChange([...selectedItems, itemId]);
    } else {
      onSelectionChange(selectedItems.filter((id) => id !== itemId));
      if (isAllSelected) {
        onAllSelectedChange(false);
      }
    }
  };

  // Close dialog helper
  function closeDialog() {
    setIsDialogOpen(false);
    setSelectedId(null);
  }

  // Handle delete action here (call API or update state)
  const handleOnDelete = async () => {
    if (!selectedId) return;

    // API call here
    try {
      const res = await deleteCategory(selectedId);

      //  delete sucess fully
      if (res.success) {
        toast({
          title: 'Category Deleted Successfully',
        });

        mutate();
      }
    } catch (error) {
      toast({
        title: 'Something went Wrong',
        variant: 'destructive',
      });

      setSelectedId('');
    }
  };

  const columns = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={(checked) => {
            if (checked) {
              onSelectionChange(categories.map((category) => category.id));
              onAllSelectedChange(true);
            } else {
              onSelectionChange([]);
              onAllSelectedChange(false);
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
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ getValue }) => <span className="text-muted-foreground text-sm">{getValue() || 'N/A'}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue();
        return <StatusBadge status={status} type={STATUS_TYPES.CATEGORY} />;
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }) => getValue() || 'N/A',
    },
    {
      accessorKey: 'id',
      header: 'Actions',
      cell: ({ row }) => {
        const categoryId = row.original.id;
        return (
          <TableActions
            id={categoryId}
            editUrl={`/dashboard/admin/taxonomies/categories/${categoryId}`}
            onDelete={(id) => {
              setSelectedId(id);
              setIsDialogOpen(true);
            }}
          />
        );
      },
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: categories,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleOnDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
