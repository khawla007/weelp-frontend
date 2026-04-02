'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, DollarSign, MousePointerClick } from 'lucide-react';
import { getCreatorStats } from '@/lib/actions/posts';

export default function CreatorStatCards({ className = 'max-w-[95%] mx-auto px-6' }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const result = await getCreatorStats();
      if (result.success) {
        setStats(result.data);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 pb-6 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-[#CFDBE54D] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      label: 'Total Clicks',
      value: stats.total_clicks.toLocaleString(),
      icon: MousePointerClick,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Sales',
      value: stats.total_sales.toLocaleString(),
      icon: TrendingUp,
      color: 'text-secondaryDark',
      bg: 'bg-green-50',
    },
    {
      label: 'Total Earnings',
      value: `$${stats.total_earnings.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 pb-6 ${className}`}>
      {statItems.map((item) => (
        <Card key={item.label} className="border border-[#435a6742]">
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`${item.bg} p-3 rounded-lg`}>
              <item.icon className={`size-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-sm text-[#5A5A5A]">{item.label}</p>
              <p className="text-xl font-semibold text-[#142A38]">{item.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
