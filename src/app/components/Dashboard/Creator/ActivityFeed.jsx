'use client';

import { useState, useEffect } from 'react';
import { getCreatorDashboardStats } from '@/lib/actions/creatorItineraries';
import { Clock, Route } from 'lucide-react';

export default function ActivityFeed({ limit = 5 }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      const result = await getCreatorDashboardStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
      setLoading(false);
    };
    fetchActivity();
  }, [limit]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No recent activity</p>
        <p className="text-sm text-muted-foreground mt-1">Start creating itineraries to see your activity here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
      <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
        <div className="p-2 bg-muted rounded-full">
          <Route className="size-4 text-copy" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">Itineraries submitted: {stats.itineraries_count || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Approved: {stats.approved_count || 0} • Pending: {stats.pending_count || 0}
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
        <div className="p-2 bg-muted rounded-full">
          <Clock className="size-4 text-copy" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">Total views: {stats.total_views || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Total likes: {stats.total_likes || 0}</p>
        </div>
      </div>
    </div>
  );
}
