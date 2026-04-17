import ZoneForm from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/transfers/zones/ZoneForm';
import { Card } from '@/components/ui/card';

export default function NewZonePage() {
  return (
    <Card className="border-none shadow-none bg-inherit p-6">
      <ZoneForm />
    </Card>
  );
}
