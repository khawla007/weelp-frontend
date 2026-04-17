import FilteredZones from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/transfers/zones/FilteredZones';
import { Card, CardContent } from '@/components/ui/card';

export default function ZonesPage() {
  return (
    <Card className="border-none shadow-none bg-inherit space-y-4">
      <CardContent>
        <FilteredZones />
      </CardContent>
    </Card>
  );
}
