// react
import { ReactNode } from 'react';

// components
import Footer from '@/components/layout/Footer';
import Navigation from '@/components/layout/Navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { TranslationProvider } from '@/contexts/TranslationContext';

// styles
import '@/styles/globals.css';

// fonts
import { lora, quicksand } from '@/fonts/fonts';

// metadata
const { TWITTER_CREATOR, TWITTER_SITE, SITE_NAME } = process.env;
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? 'https://onsishop.vercel.app'
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'OnsiShop - Premium Fashion E-commerce',
    template: '%s | OnsiShop'
  },
  description:
    'Discover premium fashion and lifestyle products at OnsiShop. Shop the latest trends with fast shipping and excellent customer service.',
  robots: {
    follow: true,
    index: true
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    title: 'OnsiShop - Premium Fashion E-commerce',
    description: 'Discover premium fashion and lifestyle products at OnsiShop.',
    siteName: 'OnsiShop'
  },
  icons: { icon: '/favicon.png' }
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${quicksand.variable} ${lora.variable} ${quicksand.className}`}>
      <body
        className="flex min-h-screen flex-col bg-gray-50 text-gray-900"
        suppressHydrationWarning={true}
      >
        <TranslationProvider>
          <LoadingProvider>
            <AuthProvider>
              <CartProvider>
                <Navigation />
                <main className="flex-1">{children}</main>
                <Footer />
              </CartProvider>
            </AuthProvider>
          </LoadingProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}
