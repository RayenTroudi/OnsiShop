import AuthCheck from '@/components/admin/AuthCheck';
import { Metadata } from 'next';

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
  return <AuthCheck>{children}</AuthCheck>;
}
