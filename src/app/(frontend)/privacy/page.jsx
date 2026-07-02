import { buildCmsPageMetadata, CmsPageTemplate } from '../cms-page-template';

export const dynamic = 'force-dynamic';

export const generateMetadata = () => buildCmsPageMetadata('privacy', '/privacy');

const PrivacyPage = () => <CmsPageTemplate slug="privacy" />;

export default PrivacyPage;
