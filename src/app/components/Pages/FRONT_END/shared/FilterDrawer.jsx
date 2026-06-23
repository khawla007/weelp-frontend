'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import FilterSidebar from './FilterSidebar';

/**
 * Mobile/tablet drawer wrapper for FilterSidebar.
 * Props mirror FilterSidebar.
 */
export default function FilterDrawer(props) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex min-h-[44px] items-center gap-2 rounded-[11.5px] border border-border bg-background px-4 py-2.5 text-[16px] font-medium text-foreground shadow-sm transition-colors duration-200 motion-reduce:transition-none hover:border-weelp-sage-deep hover:text-weelp-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <SlidersHorizontal className="size-4" />
          Filters
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] max-w-[85vw] overflow-y-auto p-4 sm:w-[360px] sm:p-5">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <FilterSidebar {...props} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
