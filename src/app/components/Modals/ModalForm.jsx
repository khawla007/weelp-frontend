'use client';

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { usePathname } from 'next/navigation';
import BookingForm from '../Form/Form';
import { X } from 'lucide-react';

const ModalForm = ({ showForm, setShowForm, handleShowForm }) => {
  const contentRef = React.useRef(null);
  const closeButtonRef = React.useRef(null);
  const previousFocusRef = React.useRef(null);
  const restoreBackgroundRef = React.useRef(null);
  const [isSearching, setIsSearching] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    if (!showForm || typeof document === 'undefined') {
      return undefined;
    }

    const hiddenElements = [];

    Array.from(document.body.children).forEach((element) => {
      if (element.hasAttribute('data-search-modal-layer')) {
        return;
      }

      hiddenElements.push({
        element,
        ariaHidden: element.getAttribute('aria-hidden'),
        inert: Boolean(element.inert),
      });

      element.setAttribute('aria-hidden', 'true');
      element.inert = true;
    });

    restoreBackgroundRef.current = () => {
      hiddenElements.forEach(({ element, ariaHidden, inert }) => {
        if (ariaHidden === null) {
          element.removeAttribute('aria-hidden');
        } else {
          element.setAttribute('aria-hidden', ariaHidden);
        }

        element.inert = inert;
      });
      restoreBackgroundRef.current = null;
    };

    return () => {
      restoreBackgroundRef.current?.();
    };
  }, [showForm]);

  const handleOpenChange = (open) => {
    if (!open) {
      setIsSearching(false);
      setShowForm(false);
    }
  };

  React.useEffect(() => {
    if (showForm && isSearching && pathname === '/search') {
      setIsSearching(false);
      setShowForm(false);
    }
  }, [isSearching, pathname, setShowForm, showForm]);

  const handleOpenAutoFocus = (event) => {
    event.preventDefault();

    if (!contentRef.current?.contains(document.activeElement)) {
      previousFocusRef.current = document.activeElement;
    }

    requestAnimationFrame(() => {
      const searchInput = contentRef.current?.querySelector('#search-destination, input, button');
      const focusTarget = searchInput || closeButtonRef.current || contentRef.current;
      focusTarget?.focus();
    });
  };

  const handleCloseAutoFocus = (event) => {
    event.preventDefault();
    restoreBackgroundRef.current?.();
    previousFocusRef.current?.focus?.();
    previousFocusRef.current = null;
  };

  return (
    <DialogPrimitive.Root open={showForm} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-search-modal-layer=""
          className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:duration-300 data-[state=closed]:duration-200 motion-reduce:animate-none"
        />
        <DialogPrimitive.Content
          ref={contentRef}
          id="portal_form"
          data-search-modal-layer=""
          data-testid="search-modal-panel"
          className="fixed inset-x-0 top-0 z-[100001] flex w-full items-start justify-center bg-transparent px-4 pt-[140px] pb-10 outline-none sm:pt-[160px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:[--tw-enter-scale:0.98] data-[state=closed]:[--tw-exit-scale:0.98] data-[state=open]:zoom-in data-[state=closed]:zoom-out data-[state=open]:duration-300 data-[state=closed]:duration-200 motion-reduce:animate-none"
          onOpenAutoFocus={handleOpenAutoFocus}
          onCloseAutoFocus={handleCloseAutoFocus}
        >
          <DialogPrimitive.Title className="sr-only">Search trips</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Choose a destination, travel dates, and guest count to search Weelp trips.</DialogPrimitive.Description>

          <BookingForm
            variant="modal"
            isSearching={isSearching}
            onSearchStart={() => setIsSearching(true)}
            controlsSlot={
              <DialogPrimitive.Close asChild>
                <button
                  ref={closeButtonRef}
                  type="button"
                  aria-label="Close search"
                  className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-red-100 bg-white text-red-600 shadow-lg shadow-black/10 transition-[background-color,color,transform,box-shadow] duration-200 ease-[var(--weelp-ease-out)] hover:bg-red-50 hover:text-red-700 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
                  onClick={handleShowForm}
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </DialogPrimitive.Close>
            }
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default ModalForm;
