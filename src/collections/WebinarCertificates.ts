import type { CollectionConfig } from 'payload'

import { staffOnly } from './access'

// Moderator and speaker certificates issued by hand from Admin → Certificates.
export const WebinarCertificates: CollectionConfig = {
  slug: 'webinar-certificates',
  access: staffOnly,
  labels: { singular: 'Webinar certificate', plural: 'Webinar certificates' },
  admin: {
    useAsTitle: 'recipient',
    defaultColumns: ['recipient', 'role', 'webinar', 'heldOn'],
    group: 'Content',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Moderator', value: 'moderator' },
        { label: 'Speaker', value: 'speaker' },
      ],
    },
    { name: 'recipient', type: 'text', required: true },
    { name: 'webinar', label: 'Webinar title', type: 'text', required: true },
    { name: 'heldOn', label: 'Date', type: 'text', required: true },
    { name: 'leftName', label: 'Left signature name', type: 'text', required: true },
    { name: 'leftTitle', label: 'Left signature title', type: 'text', required: true },
    { name: 'rightName', label: 'Right signature name', type: 'text', required: true },
    { name: 'rightTitle', label: 'Right signature title', type: 'text', required: true },
  ],
  timestamps: true,
}
