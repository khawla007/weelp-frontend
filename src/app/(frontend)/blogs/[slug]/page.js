import BannerSectionBlog from '@/app/components/Pages/FRONT_END/singleblog/BannerSection';
import ContentSection from '@/app/components/Pages/FRONT_END/singleblog/ContentSection';
import GuideSection from '@/app/components/Pages/FRONT_END/Global/GuideSection';
import { fakeData } from '@/app/Data/ShopData';
import { getSingleBlog } from '@/lib/services/blogs';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const { success, data } = await getSingleBlog(slug);

  if (!success) {
    return {
      title: 'Blog Not Found',
    };
  }

  return {
    title: data?.name || 'Single Blog Page',
    description: data?.excerpt || 'Read this blog post',
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
