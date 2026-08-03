'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function SupportRequestSuccess({ reference, onClose }) {
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-weelp-sage/15 text-weelp-sage-deep">
        <CheckCircle2 aria-hidden="true" className="h-7 w-7" />
      </div>
      <h2 ref={headingRef} tabIndex={-1} className="mt-5 text-2xl font-semibold tracking-tight text-foreground focus:outline-none">
        Your request is on its way
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Our team will reply to the email address you provided.</p>
      <div aria-label={`Support request reference ${reference}`} className="mt-6 rounded-xl border border-border bg-muted/35 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Reference</p>
        <p className="mt-1 text-lg font-semibold text-foreground">{reference}</p>
      </div>
      <Button type="button" className="mt-7 min-w-40" onClick={onClose}>
        Done
      </Button>
    </div>
  );
}
