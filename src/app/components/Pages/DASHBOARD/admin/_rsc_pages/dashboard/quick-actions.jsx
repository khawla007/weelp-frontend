'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { quickActionsData } from './constants/quick-actions.constants';
import { QuickActionsSkeleton } from './DashboardSkeleton';

export function QuickActions({ loading = false }) {
  const router = useRouter();

  if (loading) {
    return <QuickActionsSkeleton />;
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {quickActionsData.map((action, index) => {
        const IconComponent = action.icon;

        return (
          <Card
            key={index}
            className="cursor-pointer transition-all hover:bg-accent hover:shadow-md"
            onClick={() => router.push(action.url)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between w-full gap-2">
                {action.title}
                <IconComponent size={18} className="text-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="p-0 hover:bg-transparent">
                Get Started →
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
