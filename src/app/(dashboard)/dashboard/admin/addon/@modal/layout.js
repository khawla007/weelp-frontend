'use client';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function ModalLayout({ children }) {
  const router = useRouter();
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      ref.current.focus(); // ✅ safe
    }
  }, []);
  return (
    <Dialog open={true} onOpenChange={() => router.back()}>
      <DialogTitle className="sr-only">Form</DialogTitle>
      <DialogDescription className="sr-only" aria-describedby={undefined}>
        A Form Dialog Form Creating/Editing
      </DialogDescription>
      <DialogContent tabIndex={-1} ref={ref} className="sm:max-w-lg max-w-xs w-full h-[90vh] overflow-y-auto ">
        {children}
      </DialogContent>
    </Dialog>
  );
}
