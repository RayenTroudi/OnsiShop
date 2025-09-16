import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// Store active connections
const connections = new Set<ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  // Create a new ReadableStream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to our set
      connections.add(controller);
      
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({
        type: 'connected',
        timestamp: Date.now()
      })}\n\n`);
      
      // Clean up when connection closes
      request.signal.addEventListener('abort', () => {
        connections.delete(controller);
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

// Function to broadcast updates to all connected clients
export function broadcastContentUpdate(content: Record<string, string>) {
  const message = `data: ${JSON.stringify({
    type: 'content-update',
    content,
    timestamp: Date.now()
  })}\n\n`;

  // Send to all connected clients
  connections.forEach((controller) => {
    try {
      controller.enqueue(message);
    } catch (error) {
      // Remove failed connections
      connections.delete(controller);
    }
  });
}
