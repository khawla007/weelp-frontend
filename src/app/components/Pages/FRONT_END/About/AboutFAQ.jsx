'use client';

import { useState } from 'react';
import { HelpCircle, ChevronRight } from 'lucide-react';
import Reveal from '@/app/components/ui/Reveal';
import AboutImage from './AboutImage';
import SectionBadge from './SectionBadge';
import styles from './AboutPage.module.css';

const items = [
  {
    id: 'destinations',
    title: 'Which destinations does Weelp cover?',
    content: 'Weelp connects travelers with curated experiences in 120+ destinations across every continent, and we add new places regularly.',
  },
  {
    id: 'booking',
    title: 'How does booking work?',
    content: 'Browse experiences, choose your date, and book securely online. You get instant confirmation and free cancellation on most experiences.',
  },
  { id: 'guides', title: 'Are the guides local?', content: 'Yes. Every experience is led by verified local guides who know their destination first-hand.' },
  { id: 'support', title: 'What if I need help during my trip?', content: 'Our support team is available 24/7 before and during your trip via chat, email, and phone.' },
  {
    id: 'cancellation',
    title: 'What is your cancellation policy?',
    content: 'Most experiences offer free cancellation up to 24 hours before the start time. The exact policy is shown clearly on each experience.',
  },
];

const faqImage = { src: '/assets/images/hero_bg_1.jpg', alt: 'Travelers exploring a destination with Weelp', fallbackLabel: 'Destination image unavailable' };

const AboutFAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section data-about-section="faq" className="container-page pb-14 md:pb-20 lg:pb-28">
      <div className={styles.faqGrid}>
        <Reveal variant="right" data-testid="about-faq-image" className={`${styles.faqImage} ${styles.imageShell}`}>
          <AboutImage {...faqImage} fill sizes="(max-width: 1024px) 100vw, 50vw" className={`object-cover ${styles.imageZoom}`} />
        </Reveal>
        <Reveal variant="left" data-testid="about-faq-content" className={styles.faqContent}>
          <SectionBadge icon={HelpCircle}>FAQ</SectionBadge>
          <h2 className="mb-6 mt-4 text-foreground">Common questions about traveling with Weelp</h2>
          <div className="space-y-3 md:space-y-4">
            {items.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={item.id} className="overflow-hidden rounded-[24px] border border-border bg-background shadow-sm">
                  <button
                    type="button"
                    id={`faq-trigger-${item.id}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${item.id}`}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-weelp-sage-deep/40"
                  >
                    {item.title}
                    <ChevronRight
                      size={16}
                      aria-hidden="true"
                      className={`flex-shrink-0 text-weelp-sage-text transition-transform duration-300 motion-reduce:transition-none ${isOpen ? 'rotate-90' : ''}`}
                    />
                  </button>
                  <div
                    id={`faq-panel-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${item.id}`}
                    aria-hidden={!isOpen}
                    className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="min-h-0">
                      <p className="px-4 pb-4 text-sm leading-[1.6] text-muted-foreground">{item.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default AboutFAQ;
