'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, CircleHelp, Headphones } from 'lucide-react';

import { HELP_TOPICS } from './helpTopics';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const itemTypeLabel = (itemType) => `${itemType.charAt(0).toUpperCase()}${itemType.slice(1)}`;

export function HelpOverview({ context, selectedTopic, onTopicSelect, onRequestHelp }) {
  const [openFaqId, setOpenFaqId] = useState(null);
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="space-y-7 px-5 py-6 sm:px-7">
      <section aria-labelledby="help-overview-heading" className="space-y-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-weelp-sage/15 text-weelp-sage-deep">
          <CircleHelp aria-hidden="true" className="h-5 w-5" />
        </div>
        <div>
          <h2 ref={headingRef} id="help-overview-heading" tabIndex={-1} className="text-2xl font-semibold tracking-tight text-foreground focus:outline-none">
            Help with this experience
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Find a quick answer or send our team a question.</p>
        </div>
      </section>

      <section aria-label="Experience" className="rounded-2xl border border-border bg-muted/35 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {itemTypeLabel(context.itemType)} #{context.itemId}
        </p>
        <p className="mt-1.5 font-semibold leading-snug text-foreground">{context.itemTitle}</p>
      </section>

      <section aria-labelledby="help-topics-heading" className="space-y-3">
        <div>
          <h3 id="help-topics-heading" className="font-semibold text-foreground">
            What can we help with?
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Choose a topic to give us a little context.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {HELP_TOPICS.slice(0, 4).map((topic) => {
            const isSelected = selectedTopic === topic.value;

            return (
              <button
                key={topic.value}
                type="button"
                aria-pressed={isSelected}
                className={cn(
                  'inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isSelected ? 'border-weelp-sage-deep bg-weelp-sage/10 text-foreground' : 'border-border bg-background text-foreground hover:bg-muted',
                )}
                onClick={() => onTopicSelect(topic.value)}
              >
                <span>{topic.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {context.faqs.length > 0 ? (
        <section aria-labelledby="help-faq-heading" className="space-y-3">
          <h3 id="help-faq-heading" className="font-semibold text-foreground">
            Common questions
          </h3>
          <div className="space-y-2">
            {context.faqs.map((faq, index) => {
              const stableKey = faq.id ?? index;
              const triggerId = `help-faq-trigger-${stableKey}`;
              const panelId = `help-faq-panel-${stableKey}`;
              const isOpen = openFaqId === stableKey;

              return (
                <div key={stableKey} className="overflow-hidden rounded-xl border border-border bg-background">
                  <button
                    id={triggerId}
                    type="button"
                    aria-controls={panelId}
                    aria-expanded={isOpen}
                    className="flex min-h-12 w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    onClick={() => setOpenFaqId(isOpen ? null : stableKey)}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown aria-hidden="true" className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
                  </button>
                  <div id={panelId} role="region" aria-labelledby={triggerId} hidden={!isOpen} className="px-4 py-4 text-sm leading-6 text-muted-foreground">
                    {faq.answer}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl bg-foreground p-5 text-background">
        <Headphones aria-hidden="true" className="h-5 w-5" />
        <h3 className="mt-3 font-semibold">Need a personal answer?</h3>
        <p className="mt-1 text-sm text-background/70">No booking required to ask a question</p>
        <Button type="button" className="mt-4 w-full bg-background text-foreground hover:bg-background/90" onClick={onRequestHelp}>
          I still need help
        </Button>
      </section>
    </div>
  );
}
