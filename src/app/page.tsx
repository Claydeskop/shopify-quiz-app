'use client';

import createApp from '@shopify/app-bridge';
import { AppProvider, Page } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { useSearchParams } from 'next/navigation';

export default function HomePage() {
  const searchParams = useSearchParams();
  const host = searchParams.get('host') || '';

  if (typeof window !== 'undefined' && host) {
    const app = createApp({
      apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY!,
      host,
      forceRedirect: true,
    });
  }

  return (
    <AppProvider i18n={enTranslations}>
      <Page title="Shopify Embedded App">
        <p>Welcome! Your app is embedded correctly.</p>
      </Page>
    </AppProvider>
  );
}
