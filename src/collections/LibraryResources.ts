import type { CollectionConfig } from 'payload'

export const LIBRARY_TYPES = ['Guide', 'Toolkit', 'Report', 'Template'] as const

// Library page resources (guides, toolkits, reports, templates).
export const LibraryResources: CollectionConfig = {
  slug: 'library-resources',
  labels: { singular: 'Library resource', plural: 'Library' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'access', 'published'],
    group: 'Content',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'type', type: 'select', required: true, options: [...LIBRARY_TYPES] },
        {
          name: 'access',
          type: 'select',
          required: true,
          defaultValue: 'free',
          options: [
            { label: 'Free', value: 'free' },
            { label: 'Members', value: 'members' },
          ],
        },
      ],
    },
    { name: 'description', type: 'textarea', required: true },
    {
      type: 'row',
      fields: [
        { name: 'format', type: 'text', admin: { description: 'e.g. "PDF", "PDF + Excel"' } },
        { name: 'size', label: 'Length', type: 'text', admin: { description: 'e.g. "24 pages", "6 files"' } },
      ],
    },
    { name: 'file', type: 'upload', relationTo: 'media' },
    { name: 'externalUrl', label: 'Or a link', type: 'text' },
    { name: 'published', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
  ],
  timestamps: true,
}
