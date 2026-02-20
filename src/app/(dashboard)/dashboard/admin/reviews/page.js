import React from 'react';
import FilteredReview from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/reviews/FilteredReview';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

const ReviewsPage = () => {
  return (
    <Card className="border-none shadow-none bg-inherit space-y-4">
      <div className="flex justify-end">
        <Link aschild="true" href="/dashboard/admin/reviews/new">
          <Button variant="secondary">
            <Plus size={16} /> Add Review
          </Button>
        </Link>
      </div>
      <FilteredReview />
    </Card>
  );
};

export default ReviewsPage;
