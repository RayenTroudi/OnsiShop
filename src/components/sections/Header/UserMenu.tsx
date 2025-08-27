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
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setUser(null);
        window.dispatchEvent(new CustomEvent('authChange'));
        window.location.href = '/'; // Force navigation to home
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if API fails
      setUser(null);
      window.dispatchEvent(new CustomEvent('authChange'));
      window.location.href = '/';
    }
  };

  if (loading) {
    // Show a subtle loading indicator
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-9 h-9 rounded-full border-2 border-gray-200 border-t-gray-400 animate-spin"></div>
      </div>
    );
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
      <button 
        className="flex h-full items-center justify-center [&>*]:transition-all [&>*]:duration-300 hover:[&>*]:opacity-50" 
        title={`Logged in as ${user.name || user.email}`}
      >
        <Image 
          src="/images/profile.png" 
          width="36" 
          height="36" 
          alt="User Menu" 
          className="transition-all duration-300"
        />
      </button>
      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-200">
        <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
          <div className="font-medium">{user.name || 'User'}</div>
          <div className="text-xs text-gray-400">{user.email}</div>
        </div>
        {user.isAdmin && (
          <Link
            href="/admin"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            🛠️ Admin Dashboard
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
