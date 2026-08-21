'use client';

import { useState } from 'react';
import { HelpCircle, Minus, Plus } from 'lucide-react';
import AboutImage from './AboutImage';
import BlurRevealHeading from './BlurRevealHeading';
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
    <section data-about-section="faq" className={`container-page ${styles.faqSection}`}>
      <div data-testid="about-faq-heading-row" className={styles.faqHeadingRow}>
        <div className={styles.faqHeading}>
          <SectionBadge icon={HelpCircle}>Frequently Asked Questions</SectionBadge>
          <BlurRevealHeading className="mt-4 max-w-[17ch] text-foreground">Common questions about traveling with Weelp</BlurRevealHeading>
        </div>
      </div>

      <div data-testid="about-faq-content-row" className={styles.faqContentRow}>
        <div data-testid="about-faq-background-image" className={`${styles.faqImage} ${styles.imageShell}`}>
          <AboutImage {...faqImage} fill sizes="100vw" className={`object-cover ${styles.imageZoom}`} />
        </div>
        <div data-testid="about-faq-content" className={styles.faqContent}>
          <div>
            {items.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={item.id} data-testid="about-faq-item" className={styles.faqItem}>
                  <button
                    type="button"
                    id={`faq-trigger-${item.id}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${item.id}`}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className={`${styles.faqButton} weelp-plain-action`}
                  >
                    {item.title}
                    <span
                      data-testid={`about-faq-icon-${item.id}`}
                      data-state={isOpen ? 'open' : 'closed'}
                      data-icon={isOpen ? 'minus' : 'plus'}
                      aria-hidden="true"
                      className={`${styles.faqIcon} ${isOpen ? styles.faqIconOpen : ''}`}
                    >
                      {isOpen ? <Minus size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                    </span>
                  </button>
                  <div
                    id={`faq-panel-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${item.id}`}
                    aria-hidden={!isOpen}
                    className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="min-h-0">
                      <p className={styles.faqAnswer}>{item.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutFAQ;
