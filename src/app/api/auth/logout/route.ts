import { appwriteConfig } from '@/lib/appwrite/config';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Account, Client } from 'node-appwrite';

export async function POST() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('a_session_' + appwriteConfig.projectId.toLowerCase());
    
    if (sessionCookie) {
      // Delete current Appwrite session
      const client = new Client()
        .setEndpoint(appwriteConfig.endpoint)
        .setProject(appwriteConfig.projectId)
        .setSession(sessionCookie.value);
      
      const account = new Account(client);
      
      try {
        await account.deleteSession('current');
      } catch (error) {
        console.error('Error deleting Appwrite session:', error);
      }
    }

    // Clear the session cookie
    const response = NextResponse.json({
      message: 'Logout successful',
    });

    response.cookies.delete(`a_session_${appwriteConfig.projectId.toLowerCase()}`);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    // Even if session deletion fails, return success
    // (user might already be logged out)
    return NextResponse.json({
      message: 'Logout successful',
    });
  }
}
