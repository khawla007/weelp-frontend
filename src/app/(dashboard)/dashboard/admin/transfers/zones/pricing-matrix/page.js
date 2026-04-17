import PricingMatrix from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/transfers/zones/PricingMatrix';
import { Card, CardContent } from '@/components/ui/card';

export default function PricingMatrixPage() {
  return (
    <Card className="border-none shadow-none bg-inherit space-y-4">
      <CardContent>
        <PricingMatrix />
      </CardContent>
    </Card>
  );
}
