import Link from 'next/link';
import { FOOTER_EXPLORE_TAGS } from '@/app/components/Layout/shellContent';

const fontIT = 'var(--font-interTight), Inter Tight, sans-serif';

const WeelpRecommendations = () => {
  return (
    <div className="w-full bg-[#f3f5f6]">
      <div className="w-full px-[60px] py-10">
        <h3 className="text-[18px] text-[#243141] mb-2" style={{ fontFamily: fontIT, fontWeight: 600, letterSpacing: '-0.38px' }}>
          Weelp Recommendations
        </h3>
        <div className="mb-6" style={{ borderTop: '1.3px solid #e3e3e3a6' }} />
        <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {FOOTER_EXPLORE_TAGS.map((tag, i) => (
            <Link
              key={`${tag.label}-${i}`}
              href={tag.href}
              className="text-[16px] text-[#6f7680] transition hover:text-[#243141]"
              style={{ fontFamily: fontIT, fontWeight: 500, letterSpacing: '-0.38px', lineHeight: 2.06 }}
            >
              {tag.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeelpRecommendations;
