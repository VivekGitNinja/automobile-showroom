/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

if (process.env.NODE_ENV === 'production' && process.env.SENTRY_AUTH_TOKEN) {
  const { withSentryConfig } = require('@sentry/nextjs')
  module.exports = withSentryConfig(
    nextConfig,
    {
      silent: true,
      org: "apex-luxury",
      project: "showroom-frontend",
    },
    {
      widenClientFileUpload: true,
      transpileClientSDK: true,
      tunnelRoute: "/monitoring",
      hideSourceMaps: true,
      disableLogger: true,
    }
  )
} else {
  module.exports = nextConfig
}
