import Link from 'next/link';

export default function CityToursHeader({ cityName, citySlug }) {
  return (
    <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between px-4 sm:px-6 xl:px-0 py-6">
      <h2 className="text-[28px] text-[#273f4e] capitalize" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600 }}>
        {cityName} Tours
      </h2>
      <Link
        href={`/cities/${citySlug}/tours`}
        className="weelp-city-cta-button rounded-[10px] px-4 py-[10px] transition hover:opacity-95"
        style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600, fontSize: '14px' }}
      >
        Explore all tours
      </Link>
    </div>
  );
}
