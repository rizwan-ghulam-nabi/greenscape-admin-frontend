
// // new version 29/09/2026

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
//       { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
//       { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
//       { protocol: 'https', hostname: 'replicate.delivery', pathname: '/**' },
//       { protocol: 'https', hostname: '**.replicate.delivery', pathname: '/**' },
//     ],
//   },

//   async rewrites() {
//     const backendUrl = process.env.BACKEND_URL;
//     if (!backendUrl) return [];

//     // ✅ Strip trailing slash to avoid `//` in URLs
//     const cleanBackendUrl = backendUrl.replace(/\/$/, '');

//     return [
//       {
//         source: '/proxy-api/:path*',
//         destination: `${cleanBackendUrl}/api/:path*`,
//       },
//     ];
//   },
// };

// export default nextConfig;







// // new verion for performance 
// // new version — updated
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
//       { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
//       { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
//       { protocol: 'https', hostname: 'replicate.delivery', pathname: '/**' },
//       { protocol: 'https', hostname: '**.replicate.delivery', pathname: '/**' },
//     ],

//     // ✅ Serve AVIF when supported (30–50% smaller than WebP), fall back to WebP
//     formats: ['image/avif', 'image/webp'],

//     // ✅ Cache optimized variants for 1 year (they're content-hashed by URL)
//     minimumCacheTTL: 60 * 60 * 24 * 365,

//     // ✅ Tuned device breakpoints — matches Tailwind's sm/md/lg/xl/2xl
//     deviceSizes: [375, 640, 768, 1024, 1280, 1440, 1920, 2560],

//     // ✅ Small sizes for thumbnails, avatars, icons
//     imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
//   },

//   async rewrites() {
//     const backendUrl = process.env.BACKEND_URL;
//     if (!backendUrl) return [];

//     const cleanBackendUrl = backendUrl.replace(/\/$/, '');

//     return [
//       {
//         source: '/proxy-api/:path*',
//         destination: `${cleanBackendUrl}/api/:path*`,
//       },
//     ];
//   },

//   // ✅ Optional: silence the "using experimental features" warning if you enable any
//   // experimental: {},

//   // ✅ Optional: add security headers (fixes part of your Best Practices score)
//   async headers() {
//     return [
//       {
//         source: '/:path*',
//         headers: [
//           { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
//           { key: 'X-Content-Type-Options', value: 'nosniff' },
//           { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
//           { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
//           {
//             key: 'Permissions-Policy',
//             value: 'camera=(), microphone=(), geolocation=()',
//           },
//         ],
//       },
//     ];
//   },
// };

// export default nextConfig;









// next.config.mjs
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

    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    deviceSizes: [375, 640, 768, 1024, 1280, 1440, 1920, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // ✅ FIX: whitelist quality 82 (HeroCarousel uses it)
    qualities: [75, 82],
  },

  async rewrites() {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) return [];

    const cleanBackendUrl = backendUrl.replace(/\/$/, '');

    return [
      // ✅ FIX: /proxy-api/admin/* → backend /* (strip both segments)
      {
        source: '/proxy-api/admin/:path*',
        destination: `${cleanBackendUrl}/:path*`,
      },
      // ✅ Keep /proxy-api/* → backend /api/* (generic case)
      {
        source: '/proxy-api/:path*',
        destination: `${cleanBackendUrl}/api/:path*`,
      },
      // ✅ Keep /api/* → backend /api/* (direct API calls)
      {
        source: '/api/:path*',
        destination: `${cleanBackendUrl}/api/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;