import { buildCmsPageMetadata, CmsPageTemplate } from '../../cms-page-template';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return buildCmsPageMetadata(slug, `/pages/${slug}`);
}

const CmsPublicPage = async ({ params }) => {
  const { slug } = await params;
  return <CmsPageTemplate slug={slug} />;
};

export default CmsPublicPage;
