import FilteredRoutes from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/transfers/routes/FilteredRoutes';
import { Card, CardContent } from '@/components/ui/card';

export default function RoutesPage() {
  return (
    <Card className="border-none shadow-none bg-inherit space-y-4">
      <CardContent>
        <FilteredRoutes />
      </CardContent>
    </Card>
  );
}
