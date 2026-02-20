import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import clsx from 'clsx';

/**
 * A reusable component that displays a "Not Found" message
 * and provides a navigation button to redirect users.
 *
 * @component
 *
 * @param {Object} props - Component properties.
 * @param {string} [props.url="/dashboard"] - The URL to navigate back to.
 * Defaults to "/".
 *
 * @example
 * // Default usage (redirects to Home Page)
 * <NotFoundComponent />
 *
 * @example
 * // Custom redirect to a specific route
 * <NotFoundComponent url="/products" />
 */
export function NotFoundComponent({ url = '/' }) {
  return (
    <div className="h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-blueish font-semibold text-lg sm:text-2xl">Not Found</h2>
      <p className="text-muted-foreground text-sm sm:text-base">Could not find the requested resource</p>
      <Link href={url} className={clsx(buttonVariants({ variant: 'default' }), 'bg-secondaryDark')}>
        Click Here to Go Back
      </Link>
    </div>
  );
}
