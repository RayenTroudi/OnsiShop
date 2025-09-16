'use client';

import AuthCheck from '@/components/admin/AuthCheck';
import ContentAdmin from '@/components/admin/ContentAdmin';

export default function ContentManagerPage() {
  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <ContentAdmin />
        </div>
      </div>
    </AuthCheck>
  );
}