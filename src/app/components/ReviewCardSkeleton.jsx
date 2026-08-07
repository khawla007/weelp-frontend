import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const ReviewCardSkeleton = () => {
  return (
    <Card aria-hidden="true" data-testid="review-card-skeleton" className="flex w-full min-w-0 flex-col rounded-lg border-border/80 bg-background shadow-sm">
      <CardHeader data-testid="review-card-skeleton-header" className="flex w-full flex-col gap-3 p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <Skeleton className="h-6 w-3/5 sm:h-7" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>

      <Separator className="mx-auto w-11/12" />

      <CardContent className="space-y-3 p-4">
        <div data-testid="review-card-skeleton-body" className="space-y-3 rounded-md border border-border/70 bg-muted/30 p-3">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        <div data-testid="review-card-skeleton-actions" className="flex justify-end gap-2 pt-1">
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCardSkeleton;
