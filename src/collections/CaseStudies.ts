import type { CollectionConfig } from 'payload'

import { slugField } from './fields/slug'
import { caseActivity } from './hooks/activity'

export const CASE_CATEGORIES = [
  'Energy & Decarbonization',
  'Clinical Care & SusQI',
  'Waste Minimization',
  'Procurement & Logistics',
] as const

export const CASE_REGIONS = ['India', 'GCC', 'International'] as const

// Case studies: written by HSN in the admin panel, or sent from the public "Submit a case study" form
// (those arrive as "Submitted" and only appear on the site once an admin publishes them).
// Fields follow the CaseStudies list and CaseStudy page designs.
export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'organization', 'status', 'updatedAt'],
    group: 'Content',
  },
  defaultSort: '-publishedAt',
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      admin: { position: 'sidebar', description: 'Only "Published" case studies appear on the website.' },
      options: [
        { label: 'Submitted (needs review)', value: 'submitted' },
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Returned with a note', value: 'returned' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    // Review decision from the admin approval queue. The note is emailed to the submitter and shown on their dashboard.
    {
      name: 'reviewNote',
      label: 'Note to the submitter',
      type: 'textarea',
      admin: { position: 'sidebar', description: 'Shown on the submitter’s dashboard when the case study is returned.' },
    },
    { name: 'reviewedAt', type: 'date', admin: { position: 'sidebar', readOnly: true } },
    {
      type: 'row',
      fields: [
        { name: 'category', type: 'select', required: true, options: [...CASE_CATEGORIES] },
        { name: 'region', type: 'select', options: [...CASE_REGIONS] },
        { name: 'country', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'organization', label: 'Organization / hospital', type: 'text' },
        {
          name: 'color',
          label: 'List colour',
          type: 'select',
          defaultValue: '#134E5E',
          options: [
            { label: 'Dark teal', value: '#134E5E' },
            { label: 'Leaf green', value: '#4FAE4E' },
            { label: 'Aqua', value: '#5BC0E3' },
            { label: 'Deep green', value: '#0B6B3A' },
          ],
        },
      ],
    },
    { name: 'summary', type: 'textarea', required: true, admin: { description: 'Shown when the row is opened on the Case Studies page.' } },
    {
      name: 'impacts',
      label: 'Measured impact',
      type: 'array',
      maxRows: 4,
      admin: { description: 'The first one is the headline result in the list and the green card on the page.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'text', required: true, admin: { description: 'e.g. "120 tCO2e"' } },
            { name: 'label', type: 'text', required: true, admin: { description: 'e.g. "saved per year"' } },
            { name: 'note', type: 'text', admin: { description: 'e.g. "Carbon, from reduced anesthetic gas use"' } },
          ],
        },
      ],
    },
    {
      name: 'sections',
      label: 'Full case study',
      type: 'array',
      admin: { description: 'e.g. The Challenge, What the Team Did, Measuring the Impact. Each becomes a link under "On this page".' },
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'lead', label: 'Opening sentence (larger text)', type: 'textarea' },
        { name: 'body', type: 'textarea', admin: { description: 'Leave a blank line between paragraphs.' } },
        { name: 'bullets', label: 'Ticked list', type: 'array', fields: [{ name: 'text', type: 'text', required: true }] },
        {
          name: 'tableRows',
          label: 'Results table',
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'dimension', type: 'text', required: true },
                { name: 'measure', type: 'text', required: true },
                { name: 'result', type: 'text', required: true },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Shown after the first section.' },
    },
    { name: 'imageCaption', type: 'text' },
    {
      name: 'lessons',
      label: 'Lessons for other hospitals',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'textarea', required: true },
      ],
    },
    { name: 'patientSafety', label: 'Patient safety', type: 'textarea' },
    { name: 'pdf', label: 'Downloadable PDF', type: 'upload', relationTo: 'media' },
    {
      name: 'submittedBy',
      type: 'group',
      admin: { description: 'Filled when the case study came from the public form.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text' },
            { name: 'email', type: 'email' },
            { name: 'role', type: 'text' },
          ],
        },
        { name: 'attachments', type: 'upload', relationTo: 'media', hasMany: true },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.status === 'published' && !data.publishedAt) data.publishedAt = new Date().toISOString()
        return data
      },
    ],
    afterChange: [caseActivity],
  },
  timestamps: true,
}
