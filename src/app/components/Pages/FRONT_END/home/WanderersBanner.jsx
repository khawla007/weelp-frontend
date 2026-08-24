import Image from 'next/image';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import Reveal from '@/app/components/ui/Reveal';

const AVATARS = Array.from({ length: 6 }, (_, i) => i);

const SAGE_LEAF_PATH = 'M0 571.5c4.16667-99 64.89999-297 274.5-297-219.60001 0-274.5-183-274.5-274.5l0 571.5z';
const SAGE_PATTERN_CLASS = 'text-weelp-sage-deep';
const GOLD_DARK_PATTERN_CLASS = 'text-weelp-sage-deep dark:text-[oklch(0.7_0.075_78/0.48)]';

const WanderersBanner = ({ patternTone = 'sage', entrance }) => {
  const patternClassName = patternTone === 'gold-dark' ? GOLD_DARK_PATTERN_CLASS : SAGE_PATTERN_CLASS;
  const usesInwardFrame = entrance === 'inward-frame';

  const topContent = (
    <>
      <ul className="flex items-center gap-1.5" aria-hidden="true">
        {AVATARS.map((i) => (
          <li key={i} className="size-7 overflow-hidden rounded-full border border-background shadow-sm dark:shadow-none ring-1 ring-border md:size-8">
            <Image src="/assets/testimonial.png" alt="" width={32} height={32} className="size-full object-cover" />
          </li>
        ))}
      </ul>

      <p id="wanderers-heading" className="text-xs font-normal leading-5 text-copy md:text-sm">
        Be among 400+ other wanderers!
      </p>
    </>
  );

  const actionRowContent = (
    <>
      <span data-wanderers-line="left" aria-hidden="true" className={`h-px flex-1 bg-current ${patternClassName}`} />
      <NavigationLink
        href="/cities"
        data-wanderers-button=""
        className="group relative inline-flex h-11 w-[96px] shrink-0 items-center justify-center text-base font-medium leading-none !text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-weelp-sage-deep md:w-[88px] lg:h-[40px]"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[5px] bg-weelp-sage-deep transition-colors group-hover:bg-weelp-sage-hover dark:border dark:border-border dark:bg-[var(--weelp-home-page)] dark:group-hover:bg-[var(--weelp-home-page)] dark:group-hover:opacity-90"
          style={{ transform: 'skewX(-10deg)' }}
        />
        <span className="relative z-10">Curate</span>
      </NavigationLink>
      <span data-wanderers-line="right" aria-hidden="true" className={`h-px flex-1 bg-current ${patternClassName}`} />
    </>
  );

  return (
    <Reveal
      as="section"
      initialHidden
      aria-labelledby="wanderers-heading"
      data-wanderers-entrance={usesInwardFrame ? entrance : undefined}
      className="relative h-[164px] w-full overflow-hidden bg-background sm:h-[200px] md:h-[260px]"
    >
      <div className="pointer-events-none absolute left-0 top-1/2 hidden h-[190px] w-auto -translate-y-1/2 md:block lg:h-[230px]">
        <div data-wanderers-pattern="left" className="h-full">
          <svg aria-hidden="true" viewBox="0 0 275 572" preserveAspectRatio="xMinYMid meet" className={`pointer-events-none block h-full w-auto ${patternClassName}`}>
            <path d={SAGE_LEAF_PATH} fill="currentColor" />
          </svg>
        </div>
      </div>

      <div className="pointer-events-none absolute right-0 top-1/2 hidden h-[190px] w-auto -translate-y-1/2 md:block lg:h-[230px]">
        <div data-wanderers-pattern="right" className="h-full">
          <svg
            aria-hidden="true"
            viewBox="0 0 275 572"
            preserveAspectRatio="xMaxYMid meet"
            className={`pointer-events-none block h-full w-auto ${patternClassName}`}
            style={{ transform: 'scaleX(-1)' }}
          >
            <path d={SAGE_LEAF_PATH} fill="currentColor" />
          </svg>
        </div>
      </div>

      {usesInwardFrame ? (
        <div data-wanderers-top="" className="container-page relative z-10 flex h-full flex-col items-center gap-3 pt-4 text-center md:gap-4 md:pt-[21px]">
          {topContent}
        </div>
      ) : (
        <Reveal variant="lift" data-wanderers-top="" className="container-page relative z-10 flex h-full flex-col items-center gap-3 pt-4 text-center md:gap-4 md:pt-[21px]">
          {topContent}
        </Reveal>
      )}

      <div className="container-page absolute inset-x-0 top-[64%] z-10 -translate-y-1/2 md:top-[calc(50%-5px)]">
        {usesInwardFrame ? (
          <div className="flex items-center justify-center gap-3 md:gap-4">{actionRowContent}</div>
        ) : (
          <Reveal variant="lift" delay={120} className="flex items-center justify-center gap-3 md:gap-4">
            {actionRowContent}
          </Reveal>
        )}
      </div>
    </Reveal>
  );
};

export default WanderersBanner;
