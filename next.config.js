/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'googleapis',
      'google-auth-library',
      'mammoth',
      'xlsx',
      'pdf-parse'
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Escludi moduli Node.js dal bundle client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        readline: false,
        os: false,
        path: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        url: false,
        zlib: false,
        util: false
      };
    }
    
    return config;
  }
};

module.exports = nextConfig;