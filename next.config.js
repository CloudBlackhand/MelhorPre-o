/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'verovideo.com.br',
      'desktopfibra.com',
      'desktopfibra.com.br',
      'upload.wikimedia.org',
      'assets.b9.com.br',
      'alcans.com.br',
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'verovideo.com.br', pathname: '/**' },
      { protocol: 'https', hostname: 'desktopfibra.com', pathname: '/**' },
      { protocol: 'https', hostname: 'desktopfibra.com.br', pathname: '/**' },
      { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/**' },
      { protocol: 'https', hostname: 'assets.b9.com.br', pathname: '/**' },
      { protocol: 'https', hostname: 'alcans.com.br', pathname: '/**' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;


