'use client';

import { useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/app/components/Shared/StatusBadge';
import { TableActions } from '@/app/components/Shared/TableActions';
import { STATUS_TYPES } from '@/app/components/Shared/constants/statusConfig';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deleteAttribute } from '@/lib/actions/attributes';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { SelectableCardCheckbox } from '@/app/components/Checkbox/SelectableCardCheckbox';

export function DataTableAttributes({ attributes = [], mutate, selectedItems = [], onSelectionChange, attributesCount, onAllSelectedChange }) {
  const [selectedId, setSelectedId] = useState(''); // selected id for deletion
  const [isDialogOpen, setIsDialogOpen] = useState(false); // modal open for delete action
  const { toast } = useToast();
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Sync isAllSelected with parent state
  useEffect(() => {
    if (selectedItems.length === attributesCount && attributesCount > 0) {
      setIsAllSelected(true);
    } else {
      setIsAllSelected(false);
    }
  }, [selectedItems, attributesCount]);

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
      const res = await deleteAttribute(selectedId);

      //  delete sucess fully
      if (res.success) {
        toast({
          title: 'Category Deleted Successfully',
        });

        // trigger api
        mutate();
      }
    } catch (error) {
      toast({
        title: 'Something went Wrong',
        variant: 'destructive',
      });

      closeDialog();
    }
  };
  // default value of columns
  const columns = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={(checked) => {
            if (checked) {
              onSelectionChange(attributes.map((attribute) => attribute.id));
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue();
        return <StatusBadge status={status} type={STATUS_TYPES.ATTRIBUTE} />;
      },
    },
    { accessorKey: 'slug', header: 'Slug' },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }) => getValue() || 'N/A',
    },
    {
      accessorKey: 'values',
      header: 'Values',
      cell: ({ getValue }) => getValue() || 'N/A',
    },
    {
      accessorKey: 'id',
      header: 'Actions',
      cell: ({ row }) => {
        const attributeId = row.original.id;
        return (
          <TableActions
            id={attributeId}
            editUrl={`/dashboard/admin/taxonomies/attributes/${attributeId}`}
            onDelete={(id) => {
              setSelectedId(id);
              setIsDialogOpen(true);
            }}
          />
        );
      },
    },
  ];

  const table = useReactTable({
    data: attributes,
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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Attributes</CardTitle>
          <CardDescription>A list of all attributes for organizing activities</CardDescription>
        </CardHeader>
        <CardContent>
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
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    No attributes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
