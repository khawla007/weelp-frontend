import BannerSectionBlog from '@/app/components/Pages/FRONT_END/singleblog/BannerSection';
import ContentSection from '@/app/components/Pages/FRONT_END/singleblog/ContentSection';
import GuideSection from '@/app/components/Pages/FRONT_END/Global/GuideSection';
import { fakeData } from '@/app/Data/ShopData';
import { getSingleBlog } from '@/lib/services/blogs';
import { notFound } from 'next/navigation';

const META_DESCRIPTION_LIMIT = 155;
const FALLBACK_DESCRIPTION = 'Read travel stories and trip guides on Weelp.';

const stripHtml = (input) =>
  String(input ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const truncate = (text, max = META_DESCRIPTION_LIMIT) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim()}…`;
};

const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

const buildOgImageUrl = (mediaGallery) => {
  if (!Array.isArray(mediaGallery) || mediaGallery.length === 0) return null;
  const featured = mediaGallery.find((m) => m?.is_featured) ?? mediaGallery[0];
  if (!featured?.url) return null;
  return /^https?:\/\//i.test(featured.url) ? featured.url : `${apiBase}${featured.url}`;
};

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const { success, data } = await getSingleBlog(slug);

  if (!success || !data) {
    return {
      title: 'Blog Not Found',
      description: FALLBACK_DESCRIPTION,
    };
  }

  const title = data.name || 'Single Blog Page';
  const description = truncate(stripHtml(data.excerpt) || stripHtml(data.content)) || FALLBACK_DESCRIPTION;
  const ogImage = buildOgImageUrl(data.media_gallery);
  const canonical = `/blogs/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical,
      images: ogImage ? [{ url: ogImage, alt: title }] : undefined,
      publishedTime: data.created_at || undefined,
      modifiedTime: data.updated_at || undefined,
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

const SingleBlogPage = async ({ params }) => {
  const { slug } = await params;

  const { success, data } = await getSingleBlog(slug);

  if (!success) {
    notFound();
  }

  return (
    <>
      <BannerSectionBlog {...data} />
      <ContentSection content={data?.content || ''} categories={data?.categories} />
      <GuideSection sectionTitle={'Recommended'} data={fakeData} />
    </>
  );
};

export default SingleBlogPage;
