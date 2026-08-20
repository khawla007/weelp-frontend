'use client';

import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminNavigationUnseen } from '@/hooks/api/admin/navigationUnseen';

function SignalLink({ href, className, children }) {
  return (
    <NavigationLink href={href} className={`inline-flex items-center gap-1 py-3.5 font-medium ${className}`}>
      <span aria-hidden="true">●</span>
      {children}
    </NavigationLink>
  );
}

export function AttentionSummary() {
  const { counts, attention, error, isLoading } = useAdminNavigationUnseen();

  return (
    <section aria-labelledby="attention-summary-title" className="min-w-0">
      <div className="h-full rounded-[15px] border border-border bg-card p-[15px] text-card-foreground">
        <div data-testid="attention-heading" className="mb-3 flex min-h-11 items-center justify-between gap-3">
          <h2 id="attention-summary-title" className="text-sm font-semibold text-foreground">
            Needs attention
          </h2>
          <NavigationLink
            href="/dashboard/admin/orders"
            className="relative inline-flex items-center text-xs font-medium text-muted-foreground after:absolute after:-inset-x-2 after:-inset-y-3.5 after:content-[''] hover:text-foreground"
          >
            View all →
          </NavigationLink>
        </div>
        {isLoading ? (
          <div aria-label="Loading attention summary">
            <Skeleton className="h-5 w-full" />
          </div>
        ) : error ? (
          <p role="alert" className="text-sm text-destructive">
            Attention status is temporarily unavailable.
          </p>
        ) : (
          <div data-testid="attention-signals" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <SignalLink href="/dashboard/admin/orders" className="text-warning">
              {counts.orders.toLocaleString()} unseen orders
            </SignalLink>
            <SignalLink href="/dashboard/admin/reviews" className="text-info">
              {counts.reviews.toLocaleString()} unseen reviews
            </SignalLink>
            {attention.cancellations ? (
              <SignalLink href="/dashboard/admin/orders" className="text-destructive">
                Cancellation request needs review
              </SignalLink>
            ) : (
              <span>No cancellation requests need attention</span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
