export default function imageLoader({ src, width, quality }) {
  // If it's a data URL (base64), return it as-is
  if (src.startsWith('data:')) {
    return src;
  }
  
  // For other URLs, handle them normally
  if (src.startsWith('http')) {
    return src;
  }
  
  // For local paths, return them as-is (Next.js will handle them)
  return src;
}
