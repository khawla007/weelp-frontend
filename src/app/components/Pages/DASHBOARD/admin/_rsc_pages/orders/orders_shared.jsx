'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Clock, DollarSign, Plus, ShoppingCart } from 'lucide-react';
import { StatCard } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/StatCard';
import { useParams, usePathname, useRouter } from 'next/navigation';

// Order Navigation
export const NavigationOrder = ({ title, desciption, url, labelUrl }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  // accessing dynamic params for edit order page
  const { id = 0 } = params;

  if (title && desciption) {
    return (
      <div className="flex justify-between w-full py-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-4">
            {(pathname === '/dashboard/admin/orders/new' || pathname === `/dashboard/admin/orders/${id}`) && (
              <ArrowLeft
                onClick={() => {
                  router.back();
                }}
                size={18}
                className="cursor-pointer"
              />
            )}
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{desciption}</p>
        </div>

        {url && labelUrl && (
          <Button asChild>
            <Link href={url} className="bg-secondaryDark">
              <Plus size={16} />
              Create {labelUrl}
            </Link>
          </Button>
        )}
      </div>
    );
  }
  return <div className="flex justify-between w-full py-4 font-extrabold"> Props Not Passed </div>;
};

//  Order Stats
export const StatsOrdersCards = ({ summary = {} }) => {
  const {
    total_orders = 0,
    total_orders_growth = 0,
    pending_orders = 0,
    pending_orders_growth = 0,
    completed_orders = 0,
    completed_orders_growth = 0,
    total_revenue = 0,
    total_revenue_growth = 0,
    monthly_orders = 0,
    monthly_pending_orders = 0,
    monthly_completed_orders = 0,
    monthly_revenue = 0,
  } = summary;

  const formatCurrency = (amount) =>
    amount
      ? amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      : '$0';

  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

  const iconClass = 'text-[#09090B] text-sm font-medium';

  // All-time stat cards (growth = current month vs previous month)
  const allTimeCards = [
    { label: 'Total Orders', icon: <ShoppingCart size={14} className={iconClass} />, value: total_orders, change: total_orders_growth },
    { label: 'Pending Orders', icon: <Clock size={14} className={iconClass} />, value: pending_orders, change: pending_orders_growth },
    { label: 'Completed Orders', icon: <CheckCircle2 size={14} className={iconClass} />, value: completed_orders, change: completed_orders_growth },
    { label: 'Total Revenue', icon: <DollarSign size={14} className={iconClass} />, value: formatCurrency(total_revenue), change: total_revenue_growth },
  ];

  // Monthly stat cards (same growth percentages — both compare current month vs previous month)
  const monthlyCards = [
    { label: `${currentMonth} Orders`, icon: <ShoppingCart size={14} className={iconClass} />, value: monthly_orders, change: total_orders_growth },
    { label: `${currentMonth} Pending`, icon: <Clock size={14} className={iconClass} />, value: monthly_pending_orders, change: pending_orders_growth },
    { label: `${currentMonth} Completed`, icon: <CheckCircle2 size={14} className={iconClass} />, value: monthly_completed_orders, change: completed_orders_growth },
    { label: `${currentMonth} Revenue`, icon: <DollarSign size={14} className={iconClass} />, value: formatCurrency(monthly_revenue), change: total_revenue_growth },
  ];

  return (
    <div className="space-y-4">
      {/* All Time Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allTimeCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {monthlyCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
};
