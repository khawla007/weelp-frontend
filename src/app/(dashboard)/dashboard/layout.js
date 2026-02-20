import '@/app/globals.css';
import { ThemeWrapper } from './theme-wrapper';
import AppProviders from '@/app/components/Layout/ProviderWrapper';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col">
        <ThemeWrapper>
          <AppProviders>{children}</AppProviders>
        </ThemeWrapper>
      </body>
    </html>
  );
}
