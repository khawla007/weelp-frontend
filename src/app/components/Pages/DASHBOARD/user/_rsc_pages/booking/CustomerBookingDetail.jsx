'use client';

import Image from 'next/image';
import { ArrowLeft, CalendarDays, CreditCard, MapPin, MessageSquare, ShieldAlert, UserRound } from 'lucide-react';

import BookingReviewDialog from '@/app/components/BookingReviewDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCustomerOrder } from '@/hooks/api/customer/orders';
import { cn, formatCurrency } from '@/lib/utils';

const NOT_PROVIDED = 'Not provided';

function displayValue(value) {
  return value === undefined || value === null || value === '' ? NOT_PROVIDED : value;
}

function displayReviewText(value) {
  return typeof value === 'string' && value.trim() === '' ? NOT_PROVIDED : displayValue(value);
}

function formatTravelDate(value) {
  if (!value) return NOT_PROVIDED;

  const datePart = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return NOT_PROVIDED;

  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return NOT_PROVIDED;

  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return NOT_PROVIDED;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function pluralize(count, singular, plural) {
  const value = Number(count);
  if (!Number.isFinite(value)) return NOT_PROVIDED;
  return `${value} ${value === 1 ? singular : plural}`;
}

function paymentAmount(payment) {
  if (!payment) return NOT_PROVIDED;

  const rawAmount = payment.is_custom_amount ? payment.custom_amount : (payment.total_amount ?? payment.amount);
  const amount = Number(rawAmount);
  const currency = typeof payment.currency === 'string' ? payment.currency.trim().toUpperCase() : '';
  if (!Number.isFinite(amount) || !/^[A-Z]{3}$/.test(currency)) return NOT_PROVIDED;

  try {
    if (typeof Intl.supportedValuesOf === 'function' && !Intl.supportedValuesOf('currency').includes(currency)) return NOT_PROVIDED;
    return formatCurrency(amount, currency);
  } catch {
    return NOT_PROVIDED;
  }
}

function bookingImage(item) {
  const media = item?.media?.[0];
  const mediaId = Number(media?.id);

  if (Number.isSafeInteger(mediaId) && mediaId > 0) {
    return {
      src: `/api/media/${mediaId}`,
      alt: media.alt_text || media.name || item.name || 'Booking image',
    };
  }

  if (typeof media?.url === 'string' && /^\/api\/media\/\d+$/.test(media.url)) {
    return {
      src: media.url,
      alt: media.alt_text || media.name || item.name || 'Booking image',
    };
  }

  return {
    src: '/assets/Review.png',
    alt: `${item?.name || 'Booking'} booking`,
  };
}

function travelerName(user) {
  if (user?.name) return user.name;
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ');
  return displayValue(fullName);
}

function DetailSection({ icon: Icon, title, children, className = '' }) {
  return (
    <section className={cn('min-w-0 border-t border-border py-5', className)}>
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
        <Icon className="size-4 shrink-0 text-weelp-sage-deep" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm text-foreground">{displayValue(value)}</dd>
    </div>
  );
}

function BackButton({ onBack }) {
  return (
    <Button type="button" variant="ghost" className="h-9 px-2" onClick={onBack}>
      <ArrowLeft className="size-4" aria-hidden="true" />
      Back to bookings
    </Button>
  );
}

function LoadingState({ onBack }) {
  return (
    <div className="w-full p-4 md:p-8" data-testid="booking-detail-skeleton">
      <BackButton onBack={onBack} />
      <div className="mt-5 grid min-h-[480px] grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="aspect-[16/9] w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    </div>
  );
}

const CustomerBookingDetail = ({ orderId, onBack, onReviewSaved }) => {
  const { order, isLoading, error, mutate } = useCustomerOrder(orderId);

  if (isLoading) return <LoadingState onBack={onBack} />;

  if (error || !order) {
    return (
      <div className="w-full p-4 md:p-8">
        <BackButton onBack={onBack} />
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">We could not load this booking.</p>
          <Button type="button" variant="outline" onClick={() => mutate()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { item = {}, payment, user, emergency_contact: emergencyContact } = order;
  const image = bookingImage(item);
  const handleReviewSaved = () => Promise.all([mutate(), onReviewSaved?.()]);

  return (
    <div className="w-full min-w-0 bg-background p-4 md:p-8">
      <BackButton onBack={onBack} />

      <header className="mt-4 flex min-w-0 flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-semibold text-foreground">{displayValue(item.name)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Booking ID: {order.id}</p>
        </div>
        <Badge variant="outline" className="w-fit px-3 py-1.5 text-sm font-semibold capitalize">
          {displayValue(order.status)}
        </Badge>
      </header>

      <div data-testid="booking-detail-grid" className="grid grid-cols-1 gap-x-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <div data-testid="booking-detail-media" className="min-w-0 lg:col-start-1 lg:row-start-1">
          <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-md bg-muted">
            <Image src={image.src} alt={image.alt} fill sizes="(max-width: 1024px) calc(100vw - 2rem), 58vw" className="object-cover" />
          </div>

          <div className="mt-4 flex min-w-0 flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex min-w-0 items-center gap-2 break-words">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {displayValue(item.city)}
            </span>
            <span className="min-w-0 break-words">{displayValue(item.region)}</span>
          </div>
        </div>

        <div data-testid="booking-detail-travel" className="min-w-0 lg:col-start-1 lg:row-start-2">
          <DetailSection icon={CalendarDays} title="Travel details">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField label="Travel date" value={formatTravelDate(order.travel_date)} />
              <DetailField label="Preferred time" value={displayValue(order.preferred_time)} />
              <DetailField label="Adults" value={pluralize(order.number_of_adults, 'adult', 'adults')} />
              <DetailField label="Children" value={pluralize(order.number_of_children, 'child', 'children')} />
            </dl>
          </DetailSection>

          <DetailSection icon={MessageSquare} title="Special requirements">
            <p className="break-words text-sm text-foreground">{displayValue(order.special_requirements)}</p>
          </DetailSection>
        </div>

        <div data-testid="booking-detail-primary" className="min-w-0 lg:col-start-2 lg:row-start-1">
          <DetailSection icon={CreditCard} title="Payment" className="lg:mt-1 lg:border-t-0">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <DetailField label="Amount" value={paymentAmount(payment)} />
              <DetailField label="Status" value={payment?.payment_status} />
              <DetailField label="Method" value={payment?.payment_method} />
            </dl>
          </DetailSection>

          <DetailSection icon={UserRound} title="Traveler">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <DetailField label="Name" value={travelerName(user)} />
              <DetailField label="Email" value={user?.email} />
              <DetailField label="Phone" value={user?.phone} />
            </dl>
          </DetailSection>

          <DetailSection icon={ShieldAlert} title="Emergency contact">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <DetailField label="Name" value={emergencyContact?.contact_name} />
              <DetailField label="Phone" value={emergencyContact?.contact_phone} />
              <DetailField label="Relationship" value={emergencyContact?.relationship} />
            </dl>
          </DetailSection>
        </div>

        <div data-testid="booking-detail-review" className="min-w-0 lg:col-start-2 lg:row-start-2">
          <DetailSection icon={MessageSquare} title="Review">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <p className="break-words text-sm text-muted-foreground">
                  {order.review ? `${order.review.rating} out of 5 stars` : item.has_live_item === false ? 'Reviews are unavailable for archived bookings.' : 'No review added yet.'}
                </p>
                {order.review ? <p className="whitespace-pre-wrap break-words text-sm text-foreground">{displayReviewText(order.review.review_text)}</p> : null}
              </div>
              {item.has_live_item !== false ? <BookingReviewDialog booking={order} onSaved={handleReviewSaved} /> : null}
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
};

export default CustomerBookingDetail;
