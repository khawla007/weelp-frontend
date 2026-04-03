'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { AuthModal } from '../Form/AuthModal';
import useAuthModalStore from '@/lib/store/useAuthModalStore';
import useMiniCartStore from '@/lib/store/useMiniCartStore';

export default function AuthModalDialog() {
  const router = useRouter();
  const { status } = useSession();
  const { isOpen, redirectTo, referrer, closeAuthModal } = useAuthModalStore();
  const { setMiniCartOpen } = useMiniCartStore();

  const handleClose = () => {
    // If user is still unauthenticated and we have a referrer, redirect back
    if (status === 'unauthenticated' && referrer) {
      // Redirect to referrer page
      router.push(referrer);
      // Open mini cart after a short delay to ensure navigation completes
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
        <AuthModal onCloseDialog={handleClose} customUrl={redirectTo} />
      </DialogContent>
    </Dialog>
  );
}
