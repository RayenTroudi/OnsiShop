/** @type {import('next').NextConfig} */
module.exports = {
  eslint: {
    // Disabling on production builds because we're running checks on PRs via GitHub Actions.
    ignoreDuringBuilds: true
  },
  images: {
    // Enable unoptimized for base64 data URLs
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
      }
    ],
    // Add better error handling for missing images and support for data URLs
    dangerouslyAllowSVG: true
  },
  // Disable static optimization for admin and auth pages
  experimental: {
    missingSuspenseWithCSRBailout: false
  },
  async redirects() {
    return [
      {
        source: '/password',
        destination: '/',
        permanent: true
      }
    ];
  },
  // Skip static generation for problematic pages
  generateBuildId: async () => {
    return process.env.BUILD_ID || 'development';
  },
  // Vercel deployment optimizations
  experimental: {
    ...module.exports.experimental,
    serverComponentsExternalPackages: ["mongodb"]
  },
  // Optimize bundle size
  webpack: (config, { isServer }) => {
    // Optimize for smaller bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
        'timers/promises': false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        querystring: false,
      };
    }
    return config;
  }
};
