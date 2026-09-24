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
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/marques',
        destination: '/brands',
        permanent: true,
      },
      {
        source: '/marques/:slug*',
        destination: '/brands/:slug*',
        permanent: true,
      },
      {
        source: '/sell-car',
        destination: '/sell-your-car',
        permanent: true,
      },
      {
        source: '/vehicles',
        destination: '/inventory',
        permanent: true,
      },
      {
        source: '/vehicle/:slug*',
        destination: '/inventory/:slug*',
        permanent: true,
      },
      {
        source: '/cars',
        destination: '/inventory',
        permanent: true,
      },
      {
        source: '/car/:slug*',
        destination: '/inventory/:slug*',
        permanent: true,
      },
    ]
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
