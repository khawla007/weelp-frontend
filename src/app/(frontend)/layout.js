import Header from '../components/Layout/header';
import Footer from '../components/Layout/footer';
import AppProviders from '../components/Layout/ProviderWrapper';
import SeoBodyScripts from '../components/SEO/SeoBodyScripts';
import SeoFooterScripts from '../components/SEO/SeoFooterScripts';
import SeoHeadScripts from '../components/SEO/SeoHeadScripts';
import { FrontendShell } from './FrontendShell';
import { getGlobalScripts } from '@/lib/services/globalScripts';

export default async function FrontendLayout({ children }) {
  const globalScripts = await getGlobalScripts();

  return (
    <AppProviders>
      <SeoHeadScripts seo={globalScripts} idPrefix="global-seo-head" />
      <FrontendShell
        header={<Header />}
        footer={
          <>
            <Footer />
            <SeoFooterScripts seo={globalScripts} idPrefix="global-seo-footer" />
          </>
        }
      >
        <SeoBodyScripts seo={globalScripts} idPrefix="global-seo-body" />
        {children}
      </FrontendShell>
    </AppProviders>
  );
}
