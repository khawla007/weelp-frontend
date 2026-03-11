import ReviewForm from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/reviews/forms/ReviewForm';
import { Card } from '@/components/ui/card';

export default function NewReviewPage() {
  return (
    <Card className="border-none shadow-none bg-inherit p-6">
      <ReviewForm />
    </Card>
  );
}
