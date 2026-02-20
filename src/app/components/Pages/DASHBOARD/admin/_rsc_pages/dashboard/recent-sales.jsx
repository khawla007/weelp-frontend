import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const recentSales = [
  {
    username: 'John Doe',
    email: 'john@email.com',
    amount: 1299,
    icon: 'https://picsum.photos/40?random=1',
  },
  {
    username: 'Jane Smith',
    email: 'jane@email.com',
    amount: 899,
    icon: 'https://picsum.photos/40?random=2',
  },
  {
    username: 'Michael Johnson',
    email: 'michael@email.com',
    amount: 1599,
    icon: 'https://picsum.photos/40?random=3',
  },
  {
    username: 'Emily Brown',
    email: 'emily@email.com',
    amount: 749,
    icon: 'https://picsum.photos/40?random=4',
  },
  {
    username: 'David Wilson',
    email: 'david@email.com',
    amount: 1899,
    icon: 'https://picsum.photos/40?random=5',
  },
];

import { RecentSalesSkeleton } from './DashboardSkeleton';

export function RecentSales({ loading = false, data = null }) {
  if (loading) {
    return <RecentSalesSkeleton />;
  }

  // Use API data if available (and has content), otherwise use static data
  const sales = (data && data.length > 0) ? data : recentSales;

  return (
    <div className="space-y-8 w-full max-w-full grid grid-cols-1">
      {sales.map((item, index) => {
        return (
          <div key={index} className="flex  flex-wrap items-center gap-4 sm:gap-0">
            <Avatar className="h-9 w-9">
              <AvatarImage src={item.icon} alt="Avatar" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{item.username}</p>
              <p className="text-sm text-muted-foreground">{item.email}</p>
            </div>
            <div className="sm:ml-auto font-medium">+${item.amount.toLocaleString()}</div>
          </div>
        );
      })}
    </div>
  );
}
