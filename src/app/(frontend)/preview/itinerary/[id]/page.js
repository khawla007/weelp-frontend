import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import BannerSection from '@/app/components/Pages/FRONT_END/singleproduct/BannerSection';
import { auth } from '@/lib/auth/auth';
import { getAdminCreatorItinerary } from '@/lib/actions/creatorItineraries';

const SingleProductTabSection = dynamic(() => import('@/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection'));

export const metadata = {
  title: 'Preview Creator Itinerary - Weelp Admin',
};

const statusBadgeVariant = (status) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'destructive';
    case 'pending':
      return 'warning';
    default:
      return 'secondary';
  }
};

const formatStatus = (status) => {
  if (status === 'pending') return 'Pending';
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : '-';
};

export default async function CreatorItineraryPreviewPage({ params }) {
  const session = await auth();

  if (!session?.user?.role || !['admin', 'super_admin'].includes(session.user.role)) {
    redirect('/dashboard/admin');
  }

  const { id } = await params;
  const result = await getAdminCreatorItinerary(id);

  if (!result.success || !result.data) {
    return (
      <main className="min-h-screen bg-background px-6 py-20">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Preview unavailable</p>
          <h1 className="break-words text-2xl font-semibold text-foreground">Creator itinerary preview unavailable</h1>
          <p className="text-copy">This itinerary preview is missing, unavailable, or no longer ready for review.</p>
          <NavigationLink
            href="/dashboard/admin/creator-itineraries"
            className="inline-flex min-h-10 w-fit items-center gap-2 rounded-md bg-weelp-sage-deep px-4 py-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2"
          >
            <ArrowLeft className="size-4" />
            Back to creator itineraries
          </NavigationLink>
        </div>
      </main>
    );
  }

  const itinerary = result.data;
  const { name, media_gallery = [], review_summary, locations = [], schedules = [] } = itinerary;

  // Build location info for BannerSection
  const firstLocation = locations?.[0] || null;
  const citySlug = firstLocation?.city?.slug || '';
  const primaryLocation = firstLocation ? { city: firstLocation.city?.name || firstLocation.city, location_label: null } : null;

  // Calculate day/night from schedules
  const totalDays = schedules?.length || 0;
  const totalNights = totalDays > 0 ? totalDays - 1 : 0;
  const scheduleDisplay = totalDays > 0 ? `${totalDays} Day${totalDays > 1 ? 's' : ''} ${totalNights} Night${totalNights !== 1 ? 's' : ''}` : null;

  // Original link
  const originalSlug = itinerary.parent_itinerary?.slug;
  const originalCitySlug = itinerary.parent_itinerary?.locations?.[0]?.city?.slug;
  const originalLink = originalSlug && originalCitySlug ? `/cities/${originalCitySlug}/itineraries/${originalSlug}` : null;

  return (
    <>
      {/* Admin Preview Banner */}
      <div className="sticky left-0 right-0 top-0 z-[100000] bg-weelp-sage-deep px-4 py-3 text-white">
        <div className="mx-auto flex max-w-pen flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            <NavigationLink
              href="/dashboard/admin/creator-itineraries"
              className="inline-flex min-h-10 items-center gap-2 rounded-sm text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <ArrowLeft className="size-4" />
              Back
            </NavigationLink>
            <span className="min-h-10 content-center text-sm font-medium">Preview Mode</span>
            <span className="min-h-10 min-w-0 max-w-full content-center truncate text-sm text-white sm:max-w-72">Creator: {itinerary.creator?.name || '-'}</span>
            <Badge variant={statusBadgeVariant(itinerary.status)}>{formatStatus(itinerary.status)}</Badge>
          </div>
          {originalLink && (
            <a
              href={originalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 w-fit items-center gap-1 rounded-sm text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              View Original
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </div>

      {/* Same layout as real itinerary page */}
      <BannerSection activityName={name} media_gallery={media_gallery} reviewSummary={review_summary} primaryLocation={primaryLocation} city={citySlug} scheduleDisplay={scheduleDisplay} />
      <SingleProductTabSection productType="itinerary" productId={itinerary.id} productData={itinerary} itinerarySlug={itinerary.slug} session={session} itinerary={itinerary} readOnly={true} />
    </>
  );
}
