import React from 'react';
import FilteredReview from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/reviews/FilteredReview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ReviewsPage = () => {
  return (
    <Card className="border-none shadow-none bg-inherit space-y-4">
      <CardHeader>
        <div className="flex flex-col space-y-2">
          <CardTitle>Reviews</CardTitle>
          <CardDescription>View and Manage All Customer Reviews</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <FilteredReview />
      </CardContent>
    </Card>
  );
};

export default ReviewsPage;
