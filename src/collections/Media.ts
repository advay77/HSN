import type { CollectionConfig } from 'payload'

// Images and documents uploaded from the admin panel (course banners, slide images, library files).
// Private files (members-only library files, case study attachments) are not served at /api/media;
// they open through /library/<id>/file or /admin/files/<id>, which check who is asking.
export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: {
    read: ({ req }) => (req.user ? true : { private: { not_equals: true } }),
  },
  fields: [
    {
      name: 'alt',
      label: 'Alt text (describe the image for screen readers)',
      type: 'text',
    },
    {
      name: 'private',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', readOnly: true, description: 'Set automatically for members-only and submitted files.' },
    },
  ],
  upload: {
    mimeTypes: [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/csv', 'application/zip',
    ],
  },
}
