import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/*',
          '/api/*',
          '/auth/*',
          '/onboarding',
          '/goodbye',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard/*',
          '/api/*',
          '/auth/*',
        ],
      },
    ],
    sitemap: 'https://cvcrush.fr/sitemap.xml',
  }
}
