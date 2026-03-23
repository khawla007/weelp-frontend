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
import { useToast } from '@/hooks/use-toast';
import { deleteTag } from '@/lib/actions/tags';
import { Checkbox } from '@/components/ui/checkbox';
import { SelectableCardCheckbox } from '@/app/components/Checkbox/SelectableCardCheckbox';

export function DataTableTags({ tags = [], mutate, selectedItems = [], onSelectionChange, tagsCount, onAllSelectedChange }) {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Sync isAllSelected with parent state
  useEffect(() => {
    if (selectedItems.length === tagsCount && tagsCount > 0) {
      setIsAllSelected(true);
    } else {
      setIsAllSelected(false);
    }
  }, [selectedItems, tagsCount]);

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
      const res = await deleteTag(selectedId);

      //  delete sucess fully
      if (res.success) {
        toast({
          title: 'Updated Successfully',
        });
      }

      mutate();
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
              onSelectionChange(tags.map((tag) => tag.id));
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
        return <StatusBadge status={status} type={STATUS_TYPES.TAG} />;
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
        const tagId = row.original.id;
        return (
          <TableActions
            id={tagId}
            editUrl={`/dashboard/admin/taxonomies/tags/${tagId}`}
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
    data: tags,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All tags</CardTitle>
          <CardDescription>A list of all tags for organizing activities</CardDescription>
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
                    No categorys found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
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
