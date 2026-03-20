import Link from 'next/link';

export default function CityToursHeader({ cityName, citySlug }) {
  return (
    <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between px-4 sm:px-6 xl:px-0 py-6">
      <h2
        className="text-[28px] text-[#273f4e] capitalize"
        style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600 }}
      >
        {cityName} Tours
      </h2>
      <Link
        href={`/cities/${citySlug}/tours`}
        className="rounded-[10px] bg-[#0F766E] px-4 py-[10px] text-white transition hover:bg-[#0d6b63]"
        style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600, fontSize: '14px' }}
      >
        Explore all tours
      </Link>
    </div>
  );
}
