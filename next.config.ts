import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp'],
  experimental: {
    serverActions: {
      // Default is 1 MB — raise to 10 MB to support menu item image uploads.
      // Images are compressed by the imageUploadService before DB storage.
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
