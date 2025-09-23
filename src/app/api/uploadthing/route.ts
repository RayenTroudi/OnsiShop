import { ourFileRouter } from "@/lib/uploadthing";
import { createRouteHandler } from "uploadthing/next";

// Export routes for Next.js App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  
  // Optional: Add custom configuration
  config: {
    logLevel: "Info",
    isDev: process.env.NODE_ENV === "development",
  },
});