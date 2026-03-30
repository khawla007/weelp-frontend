import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RecentSalesSkeleton } from './DashboardSkeleton';

export function RecentSales({ loading = false, data = null }) {
  const sales = data ?? [];

  if (loading) {
    return <RecentSalesSkeleton />;
  }

  if (!loading && sales.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        No recent sales
      </div>
    );
  }

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
