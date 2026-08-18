import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_CATEGORIES = [
  { key: 'activities', label: 'Activities', count: 0, color: 'hsl(var(--success))' },
  { key: 'packages', label: 'Packages', count: 0, color: 'hsl(var(--info))' },
  { key: 'trips', label: 'Trips', count: 0, color: 'hsl(var(--warning))' },
];

function normalizeCategories(categories) {
  const byKey = new Map((Array.isArray(categories) ? categories : []).map((category) => [category.key, category]));
  return DEFAULT_CATEGORIES.map((fallback) => ({ ...fallback, ...byKey.get(fallback.key), color: fallback.color }));
}

function donutBackground(categories, total) {
  if (total <= 0) return 'conic-gradient(hsl(var(--muted)) 0 100%)';

  let offset = 0;
  const stops = categories.map((category) => {
    const start = offset;
    offset += (category.count / total) * 100;
    return `${category.color} ${start}% ${offset}%`;
  });
  return `conic-gradient(${stops.join(', ')})`;
}

export function BookingMix({ data = null, loading = false, error = null }) {
  const total = Number.isFinite(Number(data?.total)) ? Number(data.total) : 0;
  const categories = normalizeCategories(data?.categories);
  const leaders = Array.isArray(data?.leaders) ? data.leaders.slice(0, 2) : [];

  return (
    <section aria-labelledby="booking-mix-title" className="min-w-0">
      <div className="h-full rounded-[15px] border border-border bg-card p-[15px] text-card-foreground">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="booking-mix-title" className="text-sm font-semibold text-foreground">
            Booking mix
          </h2>
          <span className="text-xs text-muted-foreground">This month</span>
        </div>

        {loading ? (
          <div aria-label="Loading booking mix" className="space-y-4">
            <Skeleton className="mx-auto size-[112px] rounded-full" />
            <Skeleton className="mx-auto h-4 w-44" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <p role="alert" className="flex min-h-[168px] items-center justify-center text-center text-sm text-destructive">
            Booking mix is temporarily unavailable.
          </p>
        ) : (
          <>
            <div data-testid="booking-mix-donut" className="relative mx-auto grid size-[112px] place-items-center rounded-full" style={{ background: donutBackground(categories, total) }}>
              <div className="absolute inset-[18px] rounded-full bg-card" />
              <strong className="relative text-lg text-foreground">{total.toLocaleString()}</strong>
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {categories.map((category) => (
                <span key={category.key} data-testid="booking-mix-legend" className="inline-flex items-center gap-1">
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: category.color }} />
                  {category.label} {Number(category.count || 0).toLocaleString()}
                </span>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {leaders.length ? (
                leaders.map((leader) => {
                  const change = Number.isFinite(Number(leader.change)) ? Number(leader.change) : 0;
                  const changeClass = change > 0 ? 'text-success' : change < 0 ? 'text-destructive' : 'text-warning';
                  return (
                    <div key={`${leader.type}-${leader.id}`} data-testid="booking-mix-leader" className="grid grid-cols-[27px_minmax(0,1fr)_auto] items-center gap-[9px]">
                      <span data-testid="booking-mix-leader-dot" className="size-[27px] rounded-full bg-muted" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{leader.name}</p>
                        <p className="text-xs text-muted-foreground">{Number(leader.bookings || 0).toLocaleString()} bookings</p>
                      </div>
                      <span className={`text-xs font-semibold ${changeClass}`}>
                        {change > 0 ? '+' : ''}
                        {change}%
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="py-2 text-center text-sm text-muted-foreground">No supported bookings this month.</p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
