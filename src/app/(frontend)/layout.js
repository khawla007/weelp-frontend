import Header from '../components/Layout/header';
import Footer from '../components/Layout/footer';
import AppProviders from '../components/Layout/ProviderWrapper';
import { FrontendShell } from './FrontendShell';

export default function FrontendLayout({ children }) {
  return (
    <AppProviders>
      <FrontendShell header={<Header />} footer={<Footer />}>
        {children}
      </FrontendShell>
    </AppProviders>
  );
}
