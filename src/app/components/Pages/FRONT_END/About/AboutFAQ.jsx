import Image from 'next/image';
import { HelpCircle } from 'lucide-react';
import Faq from '@/app/components/Faq';
import SectionBadge from './SectionBadge';

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

const AboutFAQ = () => (
  <section className="container-page pb-10 md:pb-16 lg:pb-24">
    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
      <div>
        <SectionBadge icon={HelpCircle}>FAQ</SectionBadge>
        <h2 className="mb-6 mt-4 text-foreground">Common questions about traveling with Weelp</h2>
        <Faq items={items} />
      </div>
      <div className="relative h-[360px] w-full overflow-hidden rounded-[24px] bg-muted md:h-[460px]">
        <Image src="/assets/images/greenimage.png" alt="" fill className="object-cover" />
      </div>
    </div>
  </section>
);

export default AboutFAQ;
