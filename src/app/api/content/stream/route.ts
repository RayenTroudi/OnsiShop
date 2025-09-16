import { addConnection, removeConnection } from '@/lib/content-stream';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Create a new ReadableStream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to our set
      addConnection(controller);
      
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({
        type: 'connected',
        timestamp: Date.now()
      })}\n\n`);
      
      // Clean up when connection closes
      request.signal.addEventListener('abort', () => {
        removeConnection(controller);
        try {
          controller.close();
        } catch (error) {
          // Controller already closed
        }
      });
    }
  });

  // Return the response with appropriate headers for SSE
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
