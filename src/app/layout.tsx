// react
import { ReactNode } from 'react';

// components
import ClientProviders from '@/components/layout/ClientProviders';
import LayoutWrapper from '@/components/layout/LayoutWrapper';

// utils
import { ensureStartsWith } from '@/lib/utils';

// styles
import '@/styles/globals.css';

// fonts
import { lora, quicksand } from '@/fonts/fonts';

// metadata
const { TWITTER_CREATOR, TWITTER_SITE, SITE_NAME } = process.env;
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? 'https://clothing-store.rashidshamloo.com'
  : 'http://localhost:3000';
const twitterCreator = TWITTER_CREATOR ? ensureStartsWith(TWITTER_CREATOR, '@') : undefined;
const twitterSite = TWITTER_SITE ? ensureStartsWith(TWITTER_SITE, 'https://') : undefined;

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME!,
    template: `%s | ${SITE_NAME}`
  },
  robots: {
    follow: true,
    index: true
  },
  ...(twitterCreator &&
    twitterSite && {
      twitter: {
        card: 'summary_large_image',
        creator: twitterCreator,
        site: twitterSite,
        images: '/images/screenshots/home.webp'
      }
    }),
  icons: { icon: '/favicon.png' }
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${quicksand.variable} ${lora.variable} ${quicksand.className}`}>
      <body className="bg-white text-veryDarkPurple">
        <ClientProviders>
          <LayoutWrapper>{children}</LayoutWrapper>
        </ClientProviders>
      </body>
    </html>
  );
}
