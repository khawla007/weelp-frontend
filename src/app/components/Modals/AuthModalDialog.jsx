'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { AuthModal } from '../Form/AuthModal';
import useAuthModalStore from '@/lib/store/useAuthModalStore';
import useMiniCartStore from '@/lib/store/useMiniCartStore';

export default function AuthModalDialog() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isOpen, redirectTo, referrer, onSuccess, closeAuthModal } = useAuthModalStore();
  const { setMiniCartOpen } = useMiniCartStore();
  const wasOpenRef = useRef(false);

  // Track when modal opens so we can detect auth success
  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
    }
  }, [isOpen]);

  // Detect successful auth while modal was open
  useEffect(() => {
    if (wasOpenRef.current && status === 'authenticated' && session?.user && isOpen) {
      wasOpenRef.current = false;
      if (onSuccess) {
        // Fire the callback, then close the modal without default redirect
        const callback = onSuccess;
        closeAuthModal();
        callback(session);
      }
    }
  }, [status, session, isOpen, onSuccess, closeAuthModal]);

  const handleClose = () => {
    if (status === 'unauthenticated' && referrer) {
      router.push(referrer);
      setTimeout(() => setMiniCartOpen(true), 300);
    }
    closeAuthModal();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        showClose={false}
        className="bg-transparent border-none p-0 shadow-none"
        aria-describedby={undefined}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        <AuthModal onCloseDialog={handleClose} customUrl={onSuccess ? null : redirectTo} />
      </DialogContent>
    </Dialog>
  );
}
