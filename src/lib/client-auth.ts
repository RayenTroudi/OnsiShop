'use client';

export function checkAuth(): boolean {
  // Simple check for auth token in cookies
  if (typeof document !== 'undefined') {
    return document.cookie.includes('auth-token=');
  }
  return false;
}

export function redirectToLogin(): void {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
