/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'verovideo.com.br', 'desktopfibra.com'],
    remotePatterns: [
      { protocol: 'https', hostname: 'verovideo.com.br', pathname: '/**' },
      { protocol: 'https', hostname: 'desktopfibra.com', pathname: '/**' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;


