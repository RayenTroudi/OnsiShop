import AuthCheck from '@/components/admin/AuthCheck';
import ClientProviders from '@/components/layout/ClientProviders';
import { Metadata } from 'next';
import { lora, quicksand } from '@/fonts/fonts';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Clothing Store',
  description: 'Manage your store products and categories',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${quicksand.variable} ${lora.variable} ${quicksand.className} h-full bg-gray-50`}>
      <body className="h-full">
        <ClientProviders>
          <AuthCheck>{children}</AuthCheck>
        </ClientProviders>
      </body>
    </html>
  );
}
