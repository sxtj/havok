import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Pin workspace root to this project to avoid multi-lockfile detection noise
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default nextConfig
