import { Skeleton } from '@/components/ui/skeleton';

export function LegalPageLoading() {
  return (
    <main aria-label="Loading legal page" className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8" data-legal-page-loading role="status">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-10 w-64 max-w-full" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-11/12" />
        <Skeleton className="h-5 w-10/12" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-8/12" />
      </div>
    </main>
  );
}
