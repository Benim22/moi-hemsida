import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/profile/',
          '/order-confirmation/',
          '/auth/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/menu',
          '/order',
          '/booking',
          '/locations',
          '/contact',
          '/about',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/profile/',
          '/auth/',
        ],
      },
    ],
    sitemap: 'https://moi-sushi.se/sitemap.xml',
    host: 'https://moi-sushi.se',
  }
} 