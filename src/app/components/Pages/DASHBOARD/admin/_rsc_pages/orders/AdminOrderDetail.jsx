'use client';

import { useEffect, useRef, useState } from 'react';

import { ArrowLeft, CalendarDays, CreditCard, MessageSquare, ShieldAlert, UserRound } from 'lucide-react';

import { TypeBadge } from '@/app/components/Shared/TypeBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminOrder } from '@/hooks/api/admin/orders';
import { useToast } from '@/hooks/use-toast';
import { updateOrderStatus } from '@/lib/actions/orders';

import AdminCancellationPanel from './AdminCancellationPanel';
import { ADMIN_ORDER_STATUSES, displayOrderValue, formatCompactTimeAgo, formatOrderAmount, formatOrderTravelDate, pluralizeOrderCount } from './orderDisplay';

const DETAIL_GRID_CLASSES = 'grid min-w-0 grid-cols-1 gap-x-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]';

function DetailSection({ icon: Icon, title, children }) {
  return (
    <section className="min-w-0 border-b border-border py-5 last:border-b-0">
      <div className="mb-4 flex items-center gap-2">
        <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function DetailField({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm text-foreground">{children}</dd>
    </div>
  );
}

function BackButton({ onBack }) {
  return (
    <Button type="button" variant="ghost" size="sm" className="-ml-2 gap-2" onClick={onBack} aria-label="Back to orders">
      <ArrowLeft aria-hidden="true" className="h-4 w-4" />
      Back
    </Button>
  );
}

function LoadingState({ onBack }) {
  return (
    <div className="min-w-0 space-y-5">
      <BackButton onBack={onBack} />
      <div data-testid="admin-order-detail-skeleton" className={DETAIL_GRID_CLASSES}>
        <div className="min-w-0 space-y-4 py-3">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="min-w-0 space-y-4 py-3">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    </div>
  );
}

function FailureState({ errorStatus, onBack, onRetry }) {
  return (
    <div className="min-w-0 space-y-5">
      <BackButton onBack={onBack} />
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">We could not load this order.</h2>
        <p className="mt-1 text-sm text-muted-foreground">{errorStatus === 404 ? 'This order is no longer available.' : 'Check your connection and try again.'}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}

function capitalized(value) {
  const displayed = displayOrderValue(value);
  return displayed === 'Not provided' ? displayed : `${displayed.charAt(0).toUpperCase()}${displayed.slice(1)}`;
}

export default function AdminOrderDetail({ orderId, isTrashed, onBack, onStatusChanged }) {
  const { order, isLoading, error, errorStatus, mutate } = useAdminOrder(orderId);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [relativeNow, setRelativeNow] = useState(() => Date.now());
  const statusRequestLock = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    const intervalId = window.setInterval(() => setRelativeNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  if (isLoading) return <LoadingState onBack={onBack} />;
  if (error || !order) {
    const handleRetry = () => {
      void Promise.resolve()
        .then(() => mutate(undefined, { throwOnError: false }))
        .catch(() => undefined);
    };

    return <FailureState errorStatus={errorStatus} onBack={onBack} onRetry={handleRetry} />;
  }

  const cancellationIsUnresolved = ['pending', 'refund_processing', 'refund_failed'].includes(order.cancellation?.status);
  const statusIsReadOnly = isTrashed || order.is_trashed;
  const statusIsDisabled = isUpdatingStatus || cancellationIsUnresolved;
  const itemType = order.type || order.orderable?.item_type;
  const receivedTime = formatCompactTimeAgo(order.created_at, relativeNow);
  const hasValidReceivedDate = Boolean(order.created_at) && Number.isFinite(new Date(order.created_at).getTime());
  const payment = order.payment;
  const showCustomAmount = Boolean(payment?.is_custom_amount) && payment?.custom_amount !== undefined && payment?.custom_amount !== null && payment?.custom_amount !== '';
  const baseAmount = formatOrderAmount(payment ? { total_amount: payment.total_amount ?? payment.amount, currency: payment.currency } : null);
  const customAmount = formatOrderAmount(showCustomAmount ? { total_amount: payment.custom_amount, currency: payment.currency } : null);

  const handleStatusChange = async (nextStatus) => {
    if (statusRequestLock.current || statusIsReadOnly || cancellationIsUnresolved) return;
    statusRequestLock.current = true;
    setIsUpdatingStatus(true);

    try {
      const result = await updateOrderStatus(orderId, nextStatus);
      if (!result.success) {
        toast({ title: result.message || result.error || 'Failed to update order status.', variant: 'destructive' });
        return;
      }

      const refreshes = [Promise.resolve().then(() => mutate())];
      if (onStatusChanged) refreshes.push(Promise.resolve().then(() => onStatusChanged()));
      const refreshResults = await Promise.allSettled(refreshes);
      const refreshFailed = refreshResults.some((refreshResult) => refreshResult.status === 'rejected');

      toast({
        title: result.message || 'Order status updated successfully.',
        ...(refreshFailed ? { description: 'Status changed, but the latest data could not be refreshed.' } : {}),
      });
    } catch (statusError) {
      toast({ title: statusError?.message || 'Failed to update order status.', variant: 'destructive' });
    } finally {
      statusRequestLock.current = false;
      setIsUpdatingStatus(false);
    }
  };

  const handleCancellationResolved = async () => {
    const refreshes = [Promise.resolve().then(() => mutate())];
    if (onStatusChanged) refreshes.push(Promise.resolve().then(() => onStatusChanged()));
    const refreshResults = await Promise.allSettled(refreshes);

    if (refreshResults.some((refreshResult) => refreshResult.status === 'rejected')) {
      toast({
        title: 'Cancellation request updated.',
        description: 'Decision saved, but the latest data could not be refreshed.',
      });
    }
  };

  return (
    <div data-testid="admin-order-detail" className="min-w-0 break-words">
      <BackButton onBack={onBack} />

      <header className="mt-4 min-w-0 border-b border-border pb-5">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="break-words text-xl font-semibold text-foreground">{displayOrderValue(order.orderable?.name)}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Order #{order.id}</span>
              {itemType ? <TypeBadge type={itemType} /> : <span>Not provided</span>}
              {hasValidReceivedDate ? <time dateTime={order.created_at}>{receivedTime}</time> : <span>{receivedTime}</span>}
            </div>
          </div>

          <div className="w-full min-w-0 sm:w-44">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
            {statusIsReadOnly ? (
              <Badge variant="outline" className="capitalize">
                {capitalized(order.status)}
              </Badge>
            ) : (
              <Select value={order.status} onValueChange={handleStatusChange}>
                <SelectTrigger disabled={statusIsDisabled} aria-label={`Change status for order ${order.id}`} className="h-9 capitalize">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_ORDER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {cancellationIsUnresolved ? <p className="mt-2 text-xs text-muted-foreground">Resolve the cancellation request before changing the order status.</p> : null}
          </div>
        </div>
      </header>

      {order.cancellation ? (
        <div className="mt-5">
          <AdminCancellationPanel cancellation={order.cancellation} requester={order.user} onResolved={handleCancellationResolved} />
        </div>
      ) : null}

      <div data-testid="admin-order-detail-grid" className={DETAIL_GRID_CLASSES}>
        <div data-testid="admin-order-detail-column" className="min-w-0 break-words">
          <DetailSection icon={CalendarDays} title="Travel details">
            <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField label="Travel date">{formatOrderTravelDate(order.travel_date)}</DetailField>
              <DetailField label="Preferred time">{displayOrderValue(order.preferred_time)}</DetailField>
              <DetailField label="Adults">{pluralizeOrderCount(order.number_of_adults, 'adult', 'adults')}</DetailField>
              <DetailField label="Children">{pluralizeOrderCount(order.number_of_children, 'child', 'children')}</DetailField>
            </dl>
          </DetailSection>

          <DetailSection icon={MessageSquare} title="Special requirements">
            <p className="break-words text-sm leading-6 text-foreground">{displayOrderValue(order.special_requirements)}</p>
          </DetailSection>
        </div>

        <div data-testid="admin-order-detail-column" className="min-w-0 break-words">
          <DetailSection icon={CreditCard} title="Payment">
            <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField label="Total amount">{formatOrderAmount(payment)}</DetailField>
              <DetailField label="Base amount">{baseAmount}</DetailField>
              {showCustomAmount ? <DetailField label="Custom amount">{customAmount}</DetailField> : null}
              <DetailField label="Payment status">{displayOrderValue(payment?.payment_status)}</DetailField>
              <DetailField label="Payment method">{displayOrderValue(payment?.payment_method)}</DetailField>
            </dl>
          </DetailSection>

          <DetailSection icon={UserRound} title="Customer">
            <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField label="Name">{displayOrderValue(order.user?.name)}</DetailField>
              <DetailField label="Email">{displayOrderValue(order.user?.email)}</DetailField>
              <DetailField label="Phone">{displayOrderValue(order.user?.profile?.phone)}</DetailField>
            </dl>
          </DetailSection>

          <DetailSection icon={ShieldAlert} title="Emergency contact">
            <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField label="Name">{displayOrderValue(order.emergency_contact?.contact_name)}</DetailField>
              <DetailField label="Phone">{displayOrderValue(order.emergency_contact?.contact_phone)}</DetailField>
              <DetailField label="Relationship">{displayOrderValue(order.emergency_contact?.relationship)}</DetailField>
            </dl>
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
