import Image from 'next/image';
import Link from 'next/link';

const AVATARS = Array.from({ length: 6 }, (_, i) => i);

const SAGE_LEAF_PATH = 'M0 571.5c4.16667-99 64.89999-297 274.5-297-219.60001 0-274.5-183-274.5-274.5l0 571.5z';

const WanderersBanner = () => {
  return (
    <section aria-labelledby="wanderers-heading" className="relative w-full overflow-hidden bg-white py-20">
      <svg aria-hidden="true" viewBox="0 0 275 572" preserveAspectRatio="xMinYMid meet" className="pointer-events-none absolute bottom-[97px] left-0 hidden h-[260px] w-auto translate-y-1/2 md:block">
        <path d={SAGE_LEAF_PATH} fill="#588f7a" />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 275 572"
        preserveAspectRatio="xMaxYMid meet"
        className="pointer-events-none absolute bottom-[97px] right-0 hidden h-[260px] w-auto md:block"
        style={{ transform: 'translateY(50%) scaleX(-1)' }}
      >
        <path d={SAGE_LEAF_PATH} fill="#588f7a" />
      </svg>

      <div className="container-page relative z-10 flex flex-col items-center gap-8 text-center">
        <ul className="flex items-center gap-3" aria-hidden="true">
          {AVATARS.map((i) => (
            <li key={i} className="size-10 overflow-hidden rounded-full border border-white shadow-sm ring-1 ring-[#eaeaea]">
              <Image src="/assets/testimonial.png" alt="" width={40} height={40} className="size-full object-cover" />
            </li>
          ))}
        </ul>

        <p id="wanderers-heading" className="text-[20px] font-normal text-[#52525b]">
          Be among 400+ other wanderers!
        </p>

        <div className="flex w-full items-center justify-center gap-6">
          <span aria-hidden="true" className="h-px flex-1 bg-[#e4e4e7]" />
          <Link
            href="/cities"
            className="inline-flex shrink-0 items-center justify-center rounded-md bg-[#588f7a] px-7 py-3 text-[20px] font-semibold leading-none !text-white transition-colors hover:bg-[#4d8069]"
          >
            Curate
          </Link>
          <span aria-hidden="true" className="h-px flex-1 bg-[#e4e4e7]" />
        </div>
      </div>
    </section>
  );
};

export default WanderersBanner;
