/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'replicate.delivery', pathname: '/**' },
      { protocol: 'https', hostname: '**.replicate.delivery', pathname: '/**' },
    ],
  },

  async rewrites() {
    // In production (Vercel), BACKEND_URL is set — proxy /proxy-api/* to backend
    // In local dev, BACKEND_URL is not set, so no rewrite; browser hits localhost:5001 directly
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) return [];

    return [
      {
        source: '/proxy-api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;