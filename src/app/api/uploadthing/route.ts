import { ourFileRouter } from "@/lib/uploadthing";
import { createRouteHandler } from "uploadthing/next";

// Export routes for Next.js App Router with enhanced configuration
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  
  // Enhanced configuration for better reliability
  config: {
    logLevel: "Info",
    isDev: process.env.NODE_ENV === "development",
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/uploadthing`,
  },
});