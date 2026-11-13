import type { CollectionConfig } from 'payload'

// Advisory Board members shown on /advisory. Managed in Admin → Advisory Board.
export const Advisors: CollectionConfig = {
  slug: 'advisors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'published', 'sort'],
    group: 'Content',
  },
  defaultSort: 'sort',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', label: 'Role / title', type: 'text', admin: { description: 'One line under the name, e.g. job title and organization.' } },
    { name: 'badge', label: 'Label', type: 'text', defaultValue: 'Advisor' },
    { name: 'bio', label: 'Profile', type: 'textarea', admin: { description: 'Separate paragraphs with a blank line. The first paragraph is shown; the rest opens with Read more.' } },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    // A photo that ships with the website (used for the first advisors, before photos were uploaded in the admin).
    { name: 'photoPath', type: 'text', admin: { hidden: true } },
    { name: 'sort', label: 'Order', type: 'number', defaultValue: 0 },
    { name: 'published', type: 'checkbox', defaultValue: true },
  ],
  timestamps: true,
}
