'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Clock, DollarSign, Plus, ShoppingCart } from 'lucide-react';
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
  const { total_orders = 0, pending_orders = '', total_revenue = '' } = summary;

  // Revenue Format
  const formattedRevenue = total_revenue
    ? total_revenue.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    : '';

  // Orders Card Data
  const orderCards = [
    {
      label: 'Total Orders',
      icon: <ShoppingCart size={14} className="text-[#09090B] text-sm font-medium" />,
      total: total_orders,
      description: '+ 2.1% from last month',
    },
    {
      label: 'Pending Orders',
      icon: <Clock size={14} className="text-[#09090B] text-sm font-medium" />,
      total: pending_orders,
      description: '+ 40% of total',
    },
    {
      label: 'Completed Orders',
      icon: <CheckCircle2 size={14} className="text-[#09090B] text-sm font-medium" />,
      total: 1,
      description: '+ 20% of total',
    },
    {
      label: 'Total Revenue',
      icon: <DollarSign size={14} className="text-[#09090B] text-sm font-medium" />,
      total: `${formattedRevenue}`,
      description: '+ 12% from last month',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {orderCards.map(({ label, icon, total, description }, index) => {
        return (
          <Card key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-[#09090B] text-sm font-medium">{label}</h3>
              {icon}
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">{total}</div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
