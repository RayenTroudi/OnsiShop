'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ReservationItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    title: string;
    price: number;
    image?: string;
  };
}

interface Reservation {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
  notes?: string;
  status: string;
  totalAmount: number;
  items: ReservationItem[];
  createdAt: string;
  updatedAt: string;
}

export default function ReservationsContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/account/reservations');
      return;
    }

    if (user) {
      fetchReservations();
    }
  }, [user, authLoading, router]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reservations', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations || []);
      } else {
        setError('Failed to fetch reservations');
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setError('An error occurred while fetching reservations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Reservations</h1>
          <p className="mt-2 text-gray-600">
            Track your reservation status and delivery information
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reservations found
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't made any reservations yet. Start shopping to create your first reservation.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-purple text-white rounded-md hover:bg-purple/80"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Reservation #{reservation.id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Placed on {formatDate(reservation.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          reservation.status
                        )}`}
                      >
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        ${reservation.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="px-6 py-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Items</h4>
                  <div className="space-y-3">
                    {reservation.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                          {item.product.image ? (
                            <img
                              src={item.product.image}
                              alt={item.product.name || item.product.title}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <svg
                              className="w-6 h-6 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">
                            {item.product.name || item.product.title}
                          </h5>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity} × ${item.product.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-gray-900">
                            ${(item.quantity * item.product.price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Contact Information
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{reservation.fullName}</p>
                        <p>{reservation.email}</p>
                        <p>{reservation.phone}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Delivery Address
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{reservation.street}</p>
                        <p>
                          {reservation.city}, {reservation.zipCode}
                        </p>
                        <p>{reservation.country}</p>
                      </div>
                    </div>
                  </div>
                  {reservation.notes && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Delivery Notes
                      </h4>
                      <p className="text-sm text-gray-600">{reservation.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
