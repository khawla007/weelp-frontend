import React from 'react';
import { FilteredAddOn } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/addons/FilteredAddOn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AddOnPage = () => {
  return (
    <Card className="border-none shadow-none bg-inherit space-y-4">
      <CardHeader>
        <div className="flex flex-col space-y-2">
          <CardTitle>Add On</CardTitle>
          <CardDescription>View and Manage All Add On Services</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FilteredAddOn />
      </CardContent>
    </Card>
  );
};

export default AddOnPage;
