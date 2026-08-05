import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp'],

  experimental: {
    serverActions: {
      // Raise body limit to 10 MB to support menu image uploads.
      // Default is 1 MB which causes 413 errors on any realistic image.
      bodySizeLimit: '10mb',
    },
  },

  // Allow Next.js <Image> to load from the R2 CDN and Cloudinary.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-9f38da3a66824354926286ad73bdcb50.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;

