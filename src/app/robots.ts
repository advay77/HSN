import type { MetadataRoute } from 'next'

const SITE = 'https://healthcaresustainabilitynetwork.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/cms', '/my', '/login', '/api'],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  }
}
