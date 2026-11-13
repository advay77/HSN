import type { CollectionConfig } from 'payload'

// People shown on /founder (Our Team). Managed in Admin → Our Team.
export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'published', 'sort'],
    group: 'Content',
  },
  defaultSort: 'sort',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', label: 'Role / title', type: 'text', admin: { description: 'One line under the name.' } },
    { name: 'section', type: 'text', defaultValue: 'Core team', admin: { hidden: true } },
    { name: 'bio', label: 'Intro', type: 'textarea', admin: { description: 'Shown when someone opens this profile. Separate paragraphs with a blank line.' } },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'sort', label: 'Order', type: 'number', defaultValue: 0 },
    { name: 'published', type: 'checkbox', defaultValue: true },
  ],
  timestamps: true,
}
