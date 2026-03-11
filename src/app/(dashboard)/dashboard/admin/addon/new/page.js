import { AddOnForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/addons/forms/AddOnForm';
import { Card } from '@/components/ui/card';

export default function NewAddOnPage() {
  return (
    <Card className="border-none shadow-none bg-inherit p-6">
      <AddOnForm />
    </Card>
  );
}
