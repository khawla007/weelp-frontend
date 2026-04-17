import RouteForm from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/transfers/routes/RouteForm';
import { Card } from '@/components/ui/card';

export default function NewRoutePage() {
  return (
    <Card className="border-none shadow-none bg-inherit p-6">
      <RouteForm />
    </Card>
  );
}
