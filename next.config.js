/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rljbpvpjdofykvoszupl.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
    ],
  },
}

module.exports = nextConfig
