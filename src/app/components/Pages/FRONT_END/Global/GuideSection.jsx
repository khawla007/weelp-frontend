import BlogSection from '@/app/components/ui/BlogSection';

const GuideSection = ({ sectionTitle, data, className = 'pb-10 md:pb-16 lg:pb-24' }) => {
  if (!sectionTitle || !data) return null;

  return <BlogSection blogs={data} title={sectionTitle || 'Your Guide'} navigationId="guide-section" className={className} />;
};

export default GuideSection;
