import React from 'react';
import { FilteredAddOn } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/addons/FilteredAddOn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const AddOnPage = () => {
  return (
    <Card className="border-none shadow-none bg-inherit space-y-4">
      <CardHeader className="flex-row justify-between">
        <div className="flex flex-col space-y-2">
          <CardTitle>Add On</CardTitle>
          <CardDescription>View and Manage All Add On Services</CardDescription>
        </div>
        <Link aschild="true" href="/dashboard/admin/addon/new">
          <Button variant="secondary">
            <Plus size={16} /> Create Add On
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <FilteredAddOn />
      </CardContent>
    </Card>
  );
};

export default AddOnPage;
