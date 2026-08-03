'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { HelpOverview } from './HelpOverview';
import { SupportRequestForm } from './SupportRequestForm';
import { SupportRequestSuccess } from './SupportRequestSuccess';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';

const VIEW_ANNOUNCEMENTS = {
  overview: 'Help overview',
  form: 'Support request form',
  success: 'Support request sent',
};

export function ContextualHelpPanel({ open, onOpenChange, context, triggerRef }) {
  const { data: session } = useSession();
  const [view, setView] = useState('overview');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [reference, setReference] = useState('');
  const transitionAnnouncement = view === 'success' && reference ? `Support request sent. Reference ${reference}` : VIEW_ANNOUNCEMENTS[view];

  const handleCloseAutoFocus = (event) => {
    event.preventDefault();
    setView('overview');
    setSelectedTopic('');
    setReference('');
    triggerRef.current?.focus();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex h-dvh w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[460px]" onCloseAutoFocus={handleCloseAutoFocus}>
        <SheetTitle className="sr-only">Experience help</SheetTitle>
        <SheetDescription className="sr-only">Find answers or contact the Weelp support team about this experience.</SheetDescription>
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {transitionAnnouncement}
        </div>

        <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4 sm:px-7">
          <p className="text-sm font-semibold text-foreground">Weelp Help</p>
          <SheetClose asChild>
            <Button type="button" variant="ghost" size="icon" aria-label="Close help" className="rounded-full">
              <X aria-hidden="true" className="h-5 w-5" />
            </Button>
          </SheetClose>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {view === 'overview' ? <HelpOverview context={context} selectedTopic={selectedTopic} onTopicSelect={setSelectedTopic} onRequestHelp={() => setView('form')} /> : null}
          {view === 'form' ? (
            <SupportRequestForm
              context={context}
              selectedTopic={selectedTopic}
              session={session}
              active={open}
              onBack={() => setView('overview')}
              onSuccess={(nextReference) => {
                setReference(nextReference);
                setView('success');
              }}
            />
          ) : null}
          {view === 'success' ? <SupportRequestSuccess reference={reference} onClose={() => onOpenChange(false)} /> : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
