// components/ComingSoon.tsx
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

export function ComingSoon({ title = 'Coming Soon', description = 'We’re working hard to bring something amazing. Stay tuned!', showBack = true }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>

        <p className="text-muted-foreground text-base md:text-lg">{description}</p>

        {showBack && (
          <div className="pt-4">
            <Link href="/dashboard/admin" className={buttonVariants({ variant: 'secondary' })}>
              Click Here to Go Back
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
