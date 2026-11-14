import type { MetadataRoute } from 'next'

const SITE = 'https://healthcaresustainabilitynetwork.com'

const PATHS = ['/', '/about', '/advisory', '/founder', '/services', '/courses', '/case-studies', '/library', '/get-involved', '/membership', '/contact', '/privacy']

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return PATHS.map((path) => ({
    url: `${SITE}${path === '/' ? '' : path}`,
    lastModified,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }))
}
