'use client';

import { useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash } from 'lucide-react';
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
      onSelectionChange(selectedItems.filter(id => id !== itemId));
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
              onSelectionChange(categories.map(category => category.id));
              onAllSelectedChange(true);
            } else {
              onSelectionChange([]);
              onAllSelectedChange(false);
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
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }) => getValue() || 'N/A',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const category = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/admin/taxonomies/categories/${category.id}`} className="flex w-full cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedId(category.id);
                  setIsDialogOpen(true);
                }}
                className="text-red-600 cursor-pointer"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Categories</CardTitle>
          <CardDescription>A list of all categories for organizing activities</CardDescription>
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
