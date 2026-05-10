import Image from 'next/image';
import { IMAGE_BLUR_DATA_URL } from '@/lib/imagePlaceholder';

const ROWS = [
  {
    image: '/assets/images/AiChatassistant.png',
    alt: 'AI chat assistant suggesting off-beat places',
    eyebrow: 'AI Chat Assistant',
    title: 'Ask, and Buddy plans ahead.',
    body: 'Tell Buddy what you feel like — quiet morning, off-beat afternoon, late dinner — and it stitches the day together for you.',
    flip: false,
  },
  {
    image: '/assets/images/AiSuggestionMap.png',
    alt: 'AI map with suggested stops',
    eyebrow: 'Live Guide',
    title: 'A map that already knows where you want to go.',
    body: 'Suggested stops appear by neighborhood, scored by what is open, what is close, and what the locals actually like.',
    flip: true,
  },
  {
    image: '/assets/images/AiSaveMoney.png',
    alt: 'AI suggesting price-aware combinations',
    eyebrow: 'Curated Tips',
    title: 'Spend on the right things.',
    body: 'Buddy spots the duplicate booking, the better-priced bundle, and the day that should be a half-day. You keep the savings.',
    flip: false,
  },
  {
    image: '/assets/images/AiPersonalised.png',
    alt: 'AI personalised travel planning',
    eyebrow: 'Recommended',
    title: 'Personalised, then refined.',
    body: 'The more days you plan with Buddy, the closer it gets to your taste. Re-runs are quick, edits are expected, nothing is locked in.',
    flip: true,
  },
];

const AiSection = () => {
  return (
    <section className="container-page flex flex-col items-center gap-12 pb-24 md:pb-28 lg:pb-32">
      <h2 className="text-center text-[28px] font-medium text-[#18181b]">Your AI Travel Buddy</h2>

      <div className="flex w-full flex-col gap-12 md:gap-16 lg:gap-20">
        {ROWS.map((row, i) => (
          <div key={row.image} className={`flex flex-col items-center gap-8 lg:gap-14 ${row.flip ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
            <div className="relative aspect-[4/3] w-full lg:w-1/2">
              <Image
                src={row.image}
                alt={row.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
                className="rounded-[28px] object-cover"
                priority={i === 0}
              />
            </div>
            <div className="flex w-full flex-col gap-3 lg:w-1/2">
              <span className="text-[14px] font-semibold uppercase tracking-[0.08em] text-[#588f7a]">{row.eyebrow}</span>
              <h3 className="text-[24px] font-semibold text-[#18181b] md:text-[28px]">{row.title}</h3>
              <p className="max-w-[60ch] text-[16px] font-normal leading-[1.6] text-[#52525b] md:text-[17px]">{row.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AiSection;
