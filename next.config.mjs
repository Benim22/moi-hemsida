/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  // Security headers to fix "INTE SÄKER" warnings
  // NOTE: 'unsafe-eval' is needed for ePOS SDK and some third-party libraries
  async headers() {
    const isDev = process.env.NODE_ENV === 'development'
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              isDev 
                ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https: http: data: blob:"
                : "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://maps.googleapis.com https://www.googletagmanager.com https://static.elfsight.com data:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https: http: wss: ws: http://192.168.1.103 http://localhost:* http://127.0.0.1:*",
              "media-src 'self' https: data:",
              "frame-src 'self' https://maps.google.com https://www.google.com https://maps.googleapis.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ]
  },
  // Environment variables are now loaded from .env file
  // and don't need to be duplicated here
}

export default nextConfig

