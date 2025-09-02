'use client';

import dynamic from 'next/dynamic';

// Dynamically import the reservations content to prevent SSR issues
const ReservationsContent = dynamic(() => import('./ReservationsContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple"></div>
    </div>
  )
});

export default function ReservationsPage() {
  return <ReservationsContent />;
}
