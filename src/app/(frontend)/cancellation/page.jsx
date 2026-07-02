import { buildCmsPageMetadata, CmsPageTemplate } from '../cms-page-template';

export const dynamic = 'force-dynamic';

export const generateMetadata = () => buildCmsPageMetadata('cancellation', '/cancellation');

const CancellationPage = () => <CmsPageTemplate slug="cancellation" />;

export default CancellationPage;
