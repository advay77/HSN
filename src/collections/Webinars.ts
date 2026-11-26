import type { CollectionConfig } from 'payload'

import { staffOnly } from './access'

// Webinars shown on /webinars (Resources → Webinars). Managed in Admin → Webinars: title, date, speakers,
// and the recording as a YouTube link or an uploaded video.
export const Webinars: CollectionConfig = {
  slug: 'webinars',
  access: staffOnly,
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'heldOn', 'published'],
    group: 'Content',
  },
  defaultSort: '-heldOn',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'heldOn', label: 'Date', type: 'date', required: true, index: true },
    { name: 'time', label: 'Time', type: 'text', admin: { description: 'Optional, e.g. "6:00–7:00 pm IST".' } },
    { name: 'summary', label: 'About this webinar', type: 'textarea' },
    {
      name: 'speakers',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', label: 'Role / organization', type: 'text' },
        { name: 'label', label: 'Part in the webinar', type: 'text', defaultValue: 'Speaker', admin: { description: 'e.g. Speaker, Moderator, Panelist.' } },
        { name: 'photo', type: 'upload', relationTo: 'media' },
      ],
    },
    { name: 'youtubeUrl', label: 'YouTube link', type: 'text' },
    { name: 'video', label: 'Uploaded video', type: 'upload', relationTo: 'media' },
    { name: 'published', type: 'checkbox', defaultValue: true },
  ],
  timestamps: true,
}
