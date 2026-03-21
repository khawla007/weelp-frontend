'use client';

// Main User Page
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { UserDataTable } from './UserDataTable';
import { useToast } from '@/hooks/use-toast';
import { deleteMultipleUsers, deleteUser } from '@/lib/actions/userActions';
import { BulkActionButtons } from '@/app/components/BulkActions/BulkActionButtons';
import { AddNewButton } from '@/app/components/Button/AddNewButton';
import { FilterBar } from '@/app/components/DashboardShared/FilterBar';
import { Form } from '@/components/ui/form';
import { useForm, useWatch } from 'react-hook-form';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';
import { CustomPagination } from '@/app/components/Pagination';
import debounce from 'lodash.debounce';

// mock user
const UsersPageComponent = () => {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Initialize form
  const form = useForm({
    defaultValues: {
      search: '',
      status: 'all',
      page: 1,
    },
    mode: 'onChange',
  });

  const filters = useWatch({ control: form.control });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Debounced search
  const debouncedUpdate = useMemo(
    () =>
      debounce((newFilters) => {
        setDebouncedFilters(newFilters);
      }, 500),
    [],
  );

  // Reset page to 1 when search or status changes
  useEffect(() => {
    form.setValue('page', 1);
  }, [filters.search, filters.status]);

  // Debounced filter update
  useEffect(() => {
    const { page, ...otherFilters } = filters;
    debouncedUpdate(otherFilters);
    return () => debouncedUpdate.cancel();
  }, [filters.search, filters.status, debouncedUpdate]);

  // Memoized query string
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedFilters.search) params.append('search', debouncedFilters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    return params.toString();
  }, [debouncedFilters, filters]);

  // Fetch users with filters
  const { data = {}, isValidating, error, mutate } = useSWR(`/api/admin/users?${queryParams}`, fetcher);

  const { data: responseData = {}, total_users = 0, active_users = 0, inactive_users = 0 } = data || {};
  const { users = [], current_page = 0, per_page = 0, total = 0 } = responseData || {};

  // Stats of Users
  const UserStats = [
    { id: 1, title: 'Total Users', stats: total_users || 0 },
    { id: 2, title: 'Active Users', stats: active_users || 0 },
    { id: 3, title: 'Inactive Users', stats: inactive_users || 0 },
  ];

  // Toggle select all / unselect all
  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(users.map((user) => user.id));
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

  // Handle single delete
  const handleDelete = async (userId) => {
    try {
      const result = await deleteUser(userId);

      if (result.success) {
        toast({
          title: result.message || 'User deleted successfully',
          variant: 'default',
        });
        mutate();
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
  const handlePageChange = (newPage) => {
    form.setValue('page', newPage, { shouldValidate: true, shouldDirty: true });
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
      <div className="space-y-8">
        <CardTitle className={'text-base'}>Users Overview</CardTitle>

        {/* Search and Status Filters with Buttons */}
        <div className="flex justify-between items-center gap-4">
          <Form {...form}>
            <FilterBar
              form={form}
              searchName="search"
              searchPlaceholder="Search by name or email"
              typeFieldName="type"
              typeOptions={[]}
              statusFieldName="status"
              statusPlaceholder="All Status"
              statusOptions={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </Form>

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
            <AddNewButton href="/dashboard/admin/users/new" />
          )}
        </div>

        {isValidating && <span className="loader"></span>}
        {!isValidating && !error && (
          <>
            <UserDataTable data={users} selectedItems={selectedItems} onSelectionChange={setSelectedItems} usersCount={users.length} onAllSelectedChange={setIsAllSelected} onDelete={handleDelete} />
            <CustomPagination totalItems={total} itemsPerPage={per_page} currentPage={current_page} onPageChange={handlePageChange} />
          </>
        )}
        {error && <span className="text-red-400">Something Went Wrong</span>}
      </div>
    </div>
  );
};

export default UsersPageComponent;
