import { getSingleTransferZoneAdmin } from '@/lib/services/transferZones';
import ManageLocationsTable from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/transfers/zones/ManageLocationsTable';
import { notFound } from 'next/navigation';

export default async function ManageZoneLocationsPage({ params }) {
  const { id } = await params;
  const zone = await getSingleTransferZoneAdmin(id);
  if (!zone) notFound();

  return <ManageLocationsTable zone={zone} />;
}
