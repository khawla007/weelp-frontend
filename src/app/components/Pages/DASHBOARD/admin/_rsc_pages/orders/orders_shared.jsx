'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Clock, DollarSign, Plus, ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
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
    total_revenue_growth = 0
  } = summary;

  // Revenue Format
  const formattedRevenue = total_revenue
    ? total_revenue.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    : '$0';

  // Orders Card Data - using dynamic growth values from API
  const orderCards = [
    {
      label: 'Total Orders',
      icon: <ShoppingCart size={14} className="text-[#09090B] text-sm font-medium" />,
      total: total_orders,
      change: total_orders_growth,
    },
    {
      label: 'Pending Orders',
      icon: <Clock size={14} className="text-[#09090B] text-sm font-medium" />,
      total: pending_orders,
      change: pending_orders_growth,
    },
    {
      label: 'Completed Orders',
      icon: <CheckCircle2 size={14} className="text-[#09090B] text-sm font-medium" />,
      total: completed_orders,
      change: completed_orders_growth,
    },
    {
      label: 'Total Revenue',
      icon: <DollarSign size={14} className="text-[#09090B] text-sm font-medium" />,
      total: formattedRevenue,
      change: total_revenue_growth,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {orderCards.map(({ label, icon, total, change }, index) => {
        return (
          <Card key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:bg-accent hover:shadow-lg">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-[#09090B] text-sm font-medium">{label}</h3>
              {icon}
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">{total}</div>
              <p className={`${change >= 0 ? 'text-green-500' : 'text-red-500'} text-[12px] flex flex-wrap gap-1 items-center`}>
                {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {change > 0 ? '+' : ''}
                {change}% <span className="text-gray-400 font-medium">from last month</span>
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
