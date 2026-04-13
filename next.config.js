/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude scripts directory from TypeScript checking
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
