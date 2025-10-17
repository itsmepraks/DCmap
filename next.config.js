/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disable Strict Mode to prevent map flickering in development
  // Strict Mode causes intentional double-mounting which conflicts with Mapbox initialization
  reactStrictMode: false,
}

module.exports = nextConfig

