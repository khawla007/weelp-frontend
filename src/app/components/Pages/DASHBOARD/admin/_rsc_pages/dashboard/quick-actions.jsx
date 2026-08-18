'use client';

import NavigationLink from '@/app/components/Navigation/NavigationLink';

import { QuickActionsSkeleton } from './DashboardSkeleton';
import { quickActionsData } from './constants/quick-actions.constants';

export function QuickActions({ loading = false }) {
  return (
    <section aria-labelledby="quick-actions-title" className="min-w-0">
      <div className="h-full rounded-[15px] border border-border bg-card p-[15px] text-card-foreground">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="quick-actions-title" className="text-sm font-semibold text-foreground">
            Quick actions
          </h2>
          <span className="text-xs font-medium text-muted-foreground">Manage →</span>
        </div>
        {loading ? (
          <QuickActionsSkeleton />
        ) : (
          <div data-testid="quick-actions-grid" className="grid grid-cols-3 gap-[8px]">
            {quickActionsData.map((action) => {
              const IconComponent = action.icon;
              return (
                <NavigationLink key={action.url} href={action.url} className="rounded-[11px] border border-border bg-muted/40 p-[11px] text-foreground transition-colors hover:bg-accent">
                  <IconComponent size={18} className="mb-2 text-success" aria-hidden="true" />
                  <span className="block text-sm font-medium">{action.title}</span>
                  <span className="mt-1 block text-xs font-medium text-muted-foreground">Open →</span>
                </NavigationLink>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
