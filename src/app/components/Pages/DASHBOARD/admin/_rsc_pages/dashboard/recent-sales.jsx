import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RecentSalesSkeleton } from './DashboardSkeleton';

export function RecentSales({ loading = false, data = null }) {
  const sales = data ?? [];

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return 'NA';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  if (loading) {
    return <RecentSalesSkeleton />;
  }

  if (!loading && sales.length === 0) {
    return <div className="flex items-center justify-center h-40 text-muted-foreground">No recent sales</div>;
  }

  return (
    <div className="grid w-full max-w-full grid-cols-1 gap-4">
      {sales.map((item, index) => {
        const initials = getInitials(item.username);
        const hasCustomAvatar = item.icon && !item.icon.includes('ui-avatars.com');
        return (
          <div key={index} className="flex flex-wrap items-center gap-3">
            <Avatar className="h-9 w-9">
              {hasCustomAvatar && <AvatarImage src={item.icon} alt="Avatar" />}
              <AvatarFallback className="bg-weelp-sage-deep text-white font-medium">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{item.username}</p>
              <p className="text-sm text-muted-foreground">{item.email}</p>
            </div>
            <div className="ml-auto font-medium text-success">+${item.amount.toLocaleString()}</div>
          </div>
        );
      })}
    </div>
  );
}
