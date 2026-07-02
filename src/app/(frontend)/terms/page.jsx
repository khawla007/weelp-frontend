import { buildCmsPageMetadata, CmsPageTemplate } from '../cms-page-template';

export const dynamic = 'force-dynamic';

export const generateMetadata = () => buildCmsPageMetadata('terms', '/terms');

const TermsPage = () => <CmsPageTemplate slug="terms" />;

export default TermsPage;
