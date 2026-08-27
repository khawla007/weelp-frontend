'use client';
import React, { useId } from 'react';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createAccordionItemKeys, useAnchoredAccordion } from '@/hooks/useAnchoredAccordion';
import { useStableFaqHeight } from '@/hooks/useStableFaqHeight';
import { PUBLIC_CARD_RADIUS_CLASS } from '@/app/components/ui/cardStyles';

function Accordion({ items, headingClassName = 'py-6 text-lg font-extrabold tracking-[-0.04em] text-[var(--weelp-home-ink)] md:text-2xl lg:text-[28px]', layout = 'fluid' }) {
  const accordionId = useId();
  const itemKeys = createAccordionItemKeys(items, (item) => item.id ?? item.title);
  const [openIndex, handleToggle] = useAnchoredAccordion(itemKeys);
  const pathName = usePathname();
  const stableLayout = layout === 'stable';
  const accordionRef = useStableFaqHeight({
    enabled: stableLayout,
    contentSignature: JSON.stringify(items.map((item) => [item.id, item.title, item.content])),
  });

  return (
    <div ref={accordionRef} className="accordion" data-stable-faq={stableLayout || undefined}>
      {pathName !== '/booking' ? <h2 className={headingClassName}>FAQs</h2> : null}

      {items.map((item, index) => {
        const triggerId = `${accordionId}-trigger-${index}`;
        const panelId = `${accordionId}-panel-${index}`;

        return (
          <div key={itemKeys[index]} data-public-card="faq-item" className={`mb-3 overflow-hidden border border-[var(--weelp-home-border)] bg-background shadow-sm md:mb-4 ${PUBLIC_CARD_RADIUS_CLASS}`}>
            <button
              id={triggerId}
              type="button"
              aria-expanded={openIndex === index}
              aria-controls={panelId}
              className="flex w-full cursor-pointer items-center justify-between rounded-2xl p-3 text-left font-bold text-[var(--weelp-home-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-weelp-sage-deep/40 md:p-4"
              onClick={(event) => handleToggle(index, event.currentTarget)}
            >
              {item.title}
              <ChevronRight className={`transition-transform duration-300 motion-reduce:transition-none ${openIndex === index ? 'rotate-90' : ''}`} size={16} aria-hidden="true" />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={openIndex !== index}
              inert={openIndex !== index}
              data-faq-panel="true"
              className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-[var(--weelp-ease-panel)] motion-reduce:transition-none ${
                openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="min-h-0">
                <div data-faq-answer-content="true" className="px-4 pt-2 pb-4 text-[var(--weelp-home-copy)]">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
