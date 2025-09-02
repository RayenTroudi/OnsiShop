'use client';

import { useState } from 'react';

interface CartNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface CartNotificationProviderProps {
  children: React.ReactNode;
}

// Simple notification context
const CartNotificationContext = React.createContext<{
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
} | null>(null);

export function CartNotificationProvider({ children }: CartNotificationProviderProps) {
  const [notifications, setNotifications] = useState<CartNotification[]>([]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <CartNotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              max-w-sm p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform
              ${notification.type === 'success' ? 'bg-green-50 border-green-400 text-green-800' : ''}
              ${notification.type === 'error' ? 'bg-red-50 border-red-400 text-red-800' : ''}
              ${notification.type === 'info' ? 'bg-blue-50 border-blue-400 text-blue-800' : ''}
              animate-slide-in-right
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {notification.type === 'success' && (
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'error' && (
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="text-sm font-medium">{notification.message}</span>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </CartNotificationContext.Provider>
  );
}

export function useCartNotification() {
  const context = React.useContext(CartNotificationContext);
  if (!context) {
    throw new Error('useCartNotification must be used within CartNotificationProvider');
  }
  return context;
}

// Enhanced DatabaseAddToCart with notifications
import React from 'react';

export default function CartNotificationSystem() {
  return null; // This is just for the notification system
}
