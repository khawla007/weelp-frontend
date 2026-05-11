import Image from 'next/image';
import Link from 'next/link';

const AVATARS = Array.from({ length: 6 }, (_, i) => i);

const WanderersBanner = () => {
  return (
    <section
      aria-labelledby="wanderers-heading"
      className="relative w-full overflow-hidden bg-white py-20"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 180 374"
        preserveAspectRatio="xMinYMid meet"
        className="pointer-events-none absolute left-0 top-1/2 hidden h-[60%] w-auto -translate-y-1/2 md:block"
      >
        <path d="M0 0 C 120 60 180 140 180 187 C 180 234 120 314 0 374 Z" fill="#588f7a" />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 180 374"
        preserveAspectRatio="xMaxYMid meet"
        className="pointer-events-none absolute right-0 top-1/2 hidden h-[60%] w-auto -translate-y-1/2 md:block"
      >
        <path d="M180 0 C 60 60 0 140 0 187 C 0 234 60 314 180 374 Z" fill="#588f7a" />
      </svg>

      <div className="container-page relative z-10 flex flex-col items-center gap-6 text-center">
        <ul className="flex items-center gap-3" aria-hidden="true">
          {AVATARS.map((i) => (
            <li
              key={i}
              className="size-10 overflow-hidden rounded-full border border-white shadow-sm ring-1 ring-[#eaeaea]"
            >
              <Image
                src="/assets/testimonial.png"
                alt=""
                width={40}
                height={40}
                className="size-full object-cover"
              />
            </li>
          ))}
        </ul>

        <p id="wanderers-heading" className="text-[20px] font-normal text-[#52525b]">
          Be among 400+ other wanderers!
        </p>

        <Link
          href="/cities"
          className="inline-flex items-center justify-center rounded-md bg-[#588f7a] px-8 py-3 text-[16px] font-semibold text-white transition-colors hover:bg-[#4d8069]"
        >
          Curate
        </Link>
      </div>
    </section>
  );
};

export default WanderersBanner;
