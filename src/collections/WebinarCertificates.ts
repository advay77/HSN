import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { staffOnly } from './access'

// The first issued certificate is 001. Each one after that takes the next number.
const assignCertificateNo: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create' || data.certificateNo) return data
  const top = await req.payload.find({
    collection: 'webinar-certificates',
    where: { certificateNo: { greater_than: 0 } },
    sort: '-certificateNo',
    limit: 1,
    depth: 0,
    req,
    overrideAccess: true,
  })
  data.certificateNo = (top.docs[0]?.certificateNo ?? 0) + 1
  return data
}

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
    { name: 'certificateNo', label: 'Certificate number', type: 'number', index: true, admin: { readOnly: true } },
    { name: 'rightName', label: 'Founder name', type: 'text', required: true },
    { name: 'rightTitle', label: 'Founder title', type: 'text', required: true },
  ],
  hooks: { beforeChange: [assignCertificateNo] },
  timestamps: true,
}
