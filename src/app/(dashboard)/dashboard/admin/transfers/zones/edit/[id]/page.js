import ZoneForm from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/transfers/zones/ZoneForm';
import { getSingleTransferZoneAdmin } from '@/lib/services/transferZones';
import { Card } from '@/components/ui/card';
import { notFound } from 'next/navigation';

export default async function EditZonePage({ params }) {
  const { id } = await params;
  const zone = await getSingleTransferZoneAdmin(id);
  if (!zone) notFound();

  return (
    <Card className="border-none shadow-none bg-inherit p-6">
      <ZoneForm
        initialData={{
          name: zone.name || '',
          slug: zone.slug || '',
          description: zone.description || '',
          sort_order: zone.sort_order ?? 0,
          is_active: Boolean(zone.is_active),
        }}
      />
    </Card>
  );
}
