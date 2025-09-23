/** @type {import('nextextConfig} */
const nextConfig = {
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
      },
      {
        protocol: 'https',
        hostname: 'commondatastorage.googleapis.com'
      }
    ],
    // Add better error handling for missing images and support for data URLs
    dangerouslyAllowSVG: true
  },
  // Disable static optimization for admin and auth pages
  experimental: {
    missingSuspenseWithCSRBailout: false,
    serverComponentsExternalPackages: ["mongodb"]
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
  // Suppress MongoDB optional dependency warnings
  webpack: (config, { isServer, webpack }) => {
    // MongoDB optional dependencies that we want to ignore
    const mongoOptionalDeps = [
      'kerberos',
      '@mongodb-js/zstd', 
      '@aws-sdk/credential-providers',
      'gcp-metadata',
      'snappy',
      'socks', 
      'aws4',
      'mongodb-client-encryption'
    ];

    // Use IgnorePlugin to suppress the warnings
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: new RegExp(`^(${mongoOptionalDeps.join('|')})$`),
      })
    );

    // Add externals configuration 
    mongoOptionalDeps.forEach(dep => {
      if (Array.isArray(config.externals)) {
        config.externals.push(dep);
      } else {
        config.externals = [...(config.externals ? [config.externals] : []), dep];
      }
    });

    // Optimize for smaller bundles
    if (!isServer) {
      const fallbacks = {};
      
      // Standard fallbacks
      const standardFallbacks = {
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

      // MongoDB optional dependency fallbacks
      mongoOptionalDeps.forEach(dep => {
        fallbacks[dep] = false;
      });

      config.resolve.fallback = {
        ...config.resolve.fallback,
        ...standardFallbacks,
        ...fallbacks
      };
    }

    return config;
  }
};

module.exports = nextConfig;
