/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disable Strict Mode to prevent map flickering in development
  // Strict Mode causes intentional double-mounting which conflicts with Mapbox initialization
  reactStrictMode: false,
  
  // ESLint configuration for builds
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. Only enable during build if you've verified
    // that the errors are in unused legacy code (like disabled walk mode files).
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig

