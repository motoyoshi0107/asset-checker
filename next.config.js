/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export configuration for Netlify
  output: 'export',
  trailingSlash: true,
  // Enable strict mode for better debugging
  reactStrictMode: true,
  // Optimize images for static export
  images: {
    unoptimized: true,
    remotePatterns: []
  },
  // Environment variables for Supabase
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
}

module.exports = nextConfig