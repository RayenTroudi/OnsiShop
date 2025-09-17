'use client';

import Loading from '@/components/common/Loading';
import Header from '@/components/sections/Header';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { ReactNode, Suspense } from 'react';

const loading = () => <Loading />;
const Footer = dynamic(() => import('@/components/sections/Footer'), {
  loading
});

interface LayoutWrapperProps {
  children: ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // For admin routes, don't render the main site header/footer
  if (isAdminRoute) {
    return (
      <Suspense>
        <main>{children}</main>
      </Suspense>
    );
  }

  // For regular routes, render with header and footer
  return (
    <>
      <Header />
      <Suspense>
        <main>{children}</main>
      </Suspense>
      <Footer />
    </>
  );
}