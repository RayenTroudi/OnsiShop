'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
}

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const checkAuth = async () => {
    try {
      // For demo mode, we'll skip auth checks
      // TODO: Re-enable when auth is properly implemented
      setUser(null);
      /*
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
      */
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      // Trigger auth change event
      window.dispatchEvent(new CustomEvent('authChange'));
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!user) {
    // Show login icon for unauthenticated users
    return (
      <Link 
        href="/login" 
        className="flex h-full items-center justify-center [&>*]:transition-all [&>*]:duration-300 hover:[&>*]:opacity-50"
        title="Login"
      >
        <Image 
          src="/images/profile.png" 
          width="36" 
          height="36" 
          alt="Login" 
          className="transition-all duration-300"
        />
      </Link>
    );
  }

  // Show user menu for authenticated users
  return (
    <div className="relative group flex h-full items-center justify-center">
      <button className="flex h-full items-center justify-center [&>*]:transition-all [&>*]:duration-300 hover:[&>*]:opacity-50" title={user.name || user.email}>
        <Image 
          src="/images/profile.png" 
          width="36" 
          height="36" 
          alt="User Menu" 
          className="transition-all duration-300"
        />
      </button>
      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {user.isAdmin && (
          <Link
            href="/admin"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Admin Dashboard
          </Link>
        )}
        <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
          {user.name || user.email}
        </div>
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
