'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { quickActionsData } from './constants/quick-actions.constants';
import { QuickActionsSkeleton } from './DashboardSkeleton';

export function QuickActions({ loading = false }) {
  if (loading) {
    return <QuickActionsSkeleton />;
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {quickActionsData.map((action) => {
        const IconComponent = action.icon;

        return (
          <NavigationLink key={action.url} href={action.url} className="block">
            <Card className="cursor-pointer transition-[background-color,box-shadow] duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none hover:bg-accent hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between w-full gap-2">
                  {action.title}
                  <IconComponent size={18} className="text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-sm font-medium text-foreground">Get Started →</span>
              </CardContent>
            </Card>
          </NavigationLink>
        );
      })}
    </div>
  );
}
