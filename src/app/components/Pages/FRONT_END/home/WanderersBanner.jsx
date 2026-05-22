import Image from 'next/image';
import Link from 'next/link';

const AVATARS = Array.from({ length: 6 }, (_, i) => i);

const SAGE_LEAF_PATH = 'M0 571.5c4.16667-99 64.89999-297 274.5-297-219.60001 0-274.5-183-274.5-274.5l0 571.5z';

const WanderersBanner = () => {
  return (
    <section aria-labelledby="wanderers-heading" className="relative h-[260px] w-full overflow-hidden bg-white md:h-[300px] mb-10 md:mb-16 lg:mb-24">
      <svg
        aria-hidden="true"
        viewBox="0 0 275 572"
        preserveAspectRatio="xMinYMid meet"
        className="pointer-events-none absolute left-0 top-1/2 hidden h-[190px] w-auto -translate-y-1/2 md:block lg:h-[230px]"
      >
        <path d={SAGE_LEAF_PATH} fill="#588f7a" />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 275 572"
        preserveAspectRatio="xMaxYMid meet"
        className="pointer-events-none absolute right-0 top-1/2 hidden h-[190px] w-auto md:block lg:h-[230px]"
        style={{ transform: 'translateY(-50%) scaleX(-1)' }}
      >
        <path d={SAGE_LEAF_PATH} fill="#588f7a" />
      </svg>

      <div className="container-page relative z-10 flex h-full flex-col items-center gap-4 pt-[42px] text-center md:pt-[56px]">
        <ul className="flex items-center gap-1.5" aria-hidden="true">
          {AVATARS.map((i) => (
            <li key={i} className="size-7 overflow-hidden rounded-full border border-white shadow-sm ring-1 ring-[#e4e4e7] md:size-8">
              <Image src="/assets/testimonial.png" alt="" width={32} height={32} className="size-full object-cover" />
            </li>
          ))}
        </ul>

        <p id="wanderers-heading" className="text-xs font-normal leading-5 text-[#52525b] md:text-sm">
          Be among 400+ other wanderers!
        </p>
      </div>

      <div className="container-page absolute inset-x-0 top-[calc(50%-4px)] z-10 flex -translate-y-1/2 items-center justify-center gap-4">
        <span aria-hidden="true" className="h-px flex-1 bg-[#e4e4e7]" />
        <Link
          href="/cities"
          className="group relative inline-flex h-[34px] w-[77px] shrink-0 items-center justify-center text-xs font-medium leading-none !text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#588f7a]"
        >
          <svg aria-hidden="true" viewBox="0 0 64 28" className="absolute inset-0 size-full">
            <path d="M9 3H59L55 25H5L9 3Z" className="fill-[#588f7a] transition-colors group-hover:fill-[#4d8069]" />
          </svg>
          <span className="relative z-10">Curate</span>
        </Link>
        <span aria-hidden="true" className="h-px flex-1 bg-[#e4e4e7]" />
      </div>
    </section>
  );
};

export default WanderersBanner;
