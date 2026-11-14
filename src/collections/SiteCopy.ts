import type { CollectionConfig } from 'payload'

// The short page wording edited in Admin → Page text. One document for the whole site.
export const SiteCopy: CollectionConfig = {
  slug: 'site-copy',
  admin: { useAsTitle: 'caseStudiesTitle', group: 'Content' },
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    { name: 'aboutIntro', type: 'textarea' },
    { name: 'mission', type: 'textarea' },
    { name: 'purpose', type: 'textarea' },
    { name: 'story', type: 'textarea' },
    { name: 'team', type: 'textarea' },
    { name: 'services', type: 'json' },
    { name: 'caseStudiesTitle', type: 'text' },
    { name: 'caseStudiesMenu', type: 'text' },
    { name: 'caseStudiesIntro', type: 'textarea' },
    { name: 'pages', type: 'json' },
  ],
  timestamps: true,
}
