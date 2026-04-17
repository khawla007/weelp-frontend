import RouteForm from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/transfers/routes/RouteForm';
import { getSingleTransferRouteAdmin } from '@/lib/services/transferRoutes';
import { Card } from '@/components/ui/card';
import { notFound } from 'next/navigation';

export default async function EditRoutePage({ params }) {
  const { id } = await params;
  const route = await getSingleTransferRouteAdmin(id);
  if (!route) notFound();

  const initialData = {
    name: route.name || '',
    slug: route.slug || '',
    origin: route.origin
      ? {
          locatable_id: route.origin_id,
          locatable_type: route.origin_type,
          name: route.origin.name || '',
          city_name: route.origin.city_name ?? null,
          country_name: route.origin.country_name ?? null,
        }
      : null,
    destination: route.destination
      ? {
          locatable_id: route.destination_id,
          locatable_type: route.destination_type,
          name: route.destination.name || '',
          city_name: route.destination.city_name ?? null,
          country_name: route.destination.country_name ?? null,
        }
      : null,
    distance_km: route.distance_km ?? '',
    duration_minutes: route.duration_minutes ?? '',
    is_active: Boolean(route.is_active),
    is_popular: Boolean(route.is_popular),
  };

  return (
    <Card className="border-none shadow-none bg-inherit p-6">
      <RouteForm initialData={initialData} />
    </Card>
  );
}
