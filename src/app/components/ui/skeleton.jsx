import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-md bg-gray-200', className)} {...props} />;
}

export { Skeleton };

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md sm:max-w-fit max-w-full min-h-[360px] h-fit w-full sm:mx-0">
      {/* Image skeleton */}
      <div className="bg-gray-200 rounded-lg w-full sm:w-72 h-52 animate-pulse" />

      <div className="flex flex-col gap-[6px] justify-evenly py-1">
        {/* Rating skeleton */}
        <div className="flex gap-1 h-5">
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Title skeleton */}
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mt-3" />

        {/* Divider */}
        <div className="h-px w-full bg-gray-200 mt-3 animate-pulse" />

        {/* Price & button skeleton */}
        <div className="flex justify-between gap-2 mt-3">
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Form Input Skeleton
export function InputSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white shadow-md border p-4 rounded-md">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ cells = 5 }) {
  return (
    <tr>
      {Array.from({ length: cells }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

// Text Skeleton with width variants
export function TextSkeleton({ className = 'h-4 w-24' }) {
  return <div className={cn('animate-pulse rounded-md bg-gray-200', className)} />;
}
