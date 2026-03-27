'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { AuthModal } from '../Form/AuthModal';
import useAuthModalStore from '@/lib/store/useAuthModalStore';

export default function AuthModalDialog() {
  const { isOpen, redirectTo, closeAuthModal } = useAuthModalStore();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeAuthModal();
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
        <AuthModal onCloseDialog={closeAuthModal} customUrl={redirectTo} />
      </DialogContent>
    </Dialog>
  );
}
