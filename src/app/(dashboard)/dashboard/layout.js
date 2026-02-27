import { ThemeWrapper } from './theme-wrapper';
import AppProviders from '@/app/components/Layout/ProviderWrapper';

export default function DashboardLayout({ children }) {
  return (
    <ThemeWrapper>
      <AppProviders>{children}</AppProviders>
    </ThemeWrapper>
  );
}
