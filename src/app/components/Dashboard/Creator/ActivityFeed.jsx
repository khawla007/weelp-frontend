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
          <div key={i} className="h-16 bg-[#CFDBE54D] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-[#5A5A5A]">No recent activity</p>
        <p className="text-sm text-[#5A5A5A] mt-1">Start creating itineraries to see your activity here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-[#142A38]">Recent Activity</h3>
      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[#435a6742]">
        <div className="p-2 bg-[#CFDBE54D] rounded-full">
          <Route className="size-4 text-[#435a67]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#142A38]">Itineraries submitted: {stats.itineraries_count || 0}</p>
          <p className="text-xs text-[#5A5A5A] mt-1">
            Approved: {stats.approved_count || 0} • Pending: {stats.pending_count || 0}
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[#435a6742]">
        <div className="p-2 bg-[#CFDBE54D] rounded-full">
          <Clock className="size-4 text-[#435a67]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#142A38]">Total views: {stats.total_views || 0}</p>
          <p className="text-xs text-[#5A5A5A] mt-1">Total likes: {stats.total_likes || 0}</p>
        </div>
      </div>
    </div>
  );
}
