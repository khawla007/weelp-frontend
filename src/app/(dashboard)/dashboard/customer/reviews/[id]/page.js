import { CustomerEditReviewForm } from '@/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/forms/CustomerReviewForm';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { getSingleReviewByCustomer } from '@/lib/services/customer/reviews';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const ReviewPage = async ({ params }) => {
  const { id } = await params;

  const { success, status, data } = await getSingleReviewByCustomer(id);

  if (!success) {
    notFound();
  }

  // get reveiew data
  const review = data?.review || {};

  return (
    <div className="flex w-full p-4">
      <Card className="p-6 w-full">
        <CardTitle aschild="true" className="text-xl font-bold">
          <Link href="/dashboard/customer/reviews/">
            <ArrowLeft /> Edit Review
          </Link>
        </CardTitle>

        <CardContent className="p-0">
          <CustomerEditReviewForm reviewData={review} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewPage;
