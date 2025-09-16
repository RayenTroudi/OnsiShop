// lib/content-stream.ts - Server-Sent Events utility for content updates

// Store active connections
const connections = new Set<ReadableStreamDefaultController>();

export function addConnection(controller: ReadableStreamDefaultController) {
  connections.add(controller);
}

export function removeConnection(controller: ReadableStreamDefaultController) {
  connections.delete(controller);
}

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

export function getConnectionCount() {
  return connections.size;
}