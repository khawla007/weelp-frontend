import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
    case 'pending_approval':
      return 'warning';
    default:
      return 'secondary';
  }
};

const formatStatus = (status) => {
  if (status === 'pending_approval') return 'Pending';
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
    redirect('/dashboard/admin/creator-itineraries');
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
      <div className="bg-[#558e7b] text-white px-4 py-3 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-[1480px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/admin/creator-itineraries"
              className="inline-flex items-center gap-2 text-sm text-white"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            <span className="text-sm font-medium">Preview Mode</span>
            <span className="text-sm text-white">Creator: {itinerary.creator?.name || '-'}</span>
            <Badge variant={statusBadgeVariant(itinerary.approval_status)}>
              {formatStatus(itinerary.approval_status)}
            </Badge>
          </div>
          {originalLink && (
            <a
              href={originalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white inline-flex items-center gap-1"
            >
              View Original
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </div>

      {/* Spacer for fixed banner */}
      <div className="h-[44px]" />

      {/* Same layout as real itinerary page */}
      <BannerSection
        activityName={name}
        media_gallery={media_gallery}
        reviewSummary={review_summary}
        primaryLocation={primaryLocation}
        city={citySlug}
        scheduleDisplay={scheduleDisplay}
      />
      <SingleProductTabSection
        productType="itinerary"
        productId={itinerary.id}
        productData={itinerary}
        itinerarySlug={itinerary.slug}
        session={session}
        itinerary={itinerary}
        readOnly={true}
      />
    </>
  );
}
