'use client';

// Main User Page
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { UserDataTable } from './UserDataTable';
import { useAllUsersAdmin } from '@/hooks/api/admin/users';
import { useToast } from '@/hooks/use-toast';
import { deleteMultipleUsers } from '@/lib/actions/userActions';
import { BulkActionButtons } from '@/app/components/BulkActions/BulkActionButtons';
import { AddNewButton } from '@/app/components/Button/AddNewButton';

// mock user
const UsersPageComponent = () => {
  // Fetching All Users
  const {
    users: { users = [], active_users = 0, pending_users = 0, total_users = 0 },
    error,
    isLoading,
    mutate,
  } = useAllUsersAdmin();

  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  if (isLoading) return <span className="loader"></span>;
  if (error) return <span className="text-red-400">{error}</span>;

  // Stats of Users
  const UserStats = [
    { id: 1, title: 'Total Users', stats: total_users || 0 },
    { id: 2, title: 'Active Users', stats: active_users || 0 },
    { id: 3, title: 'Pending Users', stats: pending_users || 0 },
  ];

  // Toggle select all / unselect all
  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(users.map(user => user.id));
    }
    setIsAllSelected(!isAllSelected);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const result = await deleteMultipleUsers(selectedItems);

      if (result.success) {
        toast({
          title: `${selectedItems.length} users deleted`,
          variant: 'success',
        });
        mutate();
        setSelectedItems([]);
        setIsAllSelected(false);
      } else {
        toast({
          title: 'Delete failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Handle page change - clear selections
  const handlePageChange = () => {
    setSelectedItems([]);
    setIsAllSelected(false);
  };

  return (
    <div className="space-y-4 sm:p-8 sm:pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Users</h2>
          <p className="text-base">Manage system users and their access</p>
        </div>
        {selectedItems.length > 0 ? (
          <BulkActionButtons
            selectedCount={selectedItems.length}
            totalCount={users.length}
            isAllSelected={isAllSelected}
            onSelectAllToggle={handleSelectAllToggle}
            onDelete={handleBulkDelete}
            deleteLabel="Delete"
          />
        ) : (
          <AddNewButton
            href="/dashboard/admin/users/new"
          />
        )}
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {/* {Mapping Data */}
        {UserStats.map((item, index) => {
          return (
            <Card key={index} className="hover:shadow-md ease-in-out duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-base font-bold">{item.stats}</div>
                <p className="text-sm">Across all departments</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* tables */}
      <Card className="shadow-none  mx-auto p-10 space-y-2">
        <CardTitle className={'text-base mb-8'}>Users Overview</CardTitle>
        <UserDataTable
          data={users}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          usersCount={users.length}
          onAllSelectedChange={setIsAllSelected}
          onPageChange={handlePageChange}
        />
      </Card>
    </div>
  );
};

export default UsersPageComponent;
