import type { TextField } from 'payload'

export const toSlug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

// URL slug filled from another field when left empty.
export const slugField = (from: string): TextField => ({
  name: 'slug',
  label: 'Web address',
  type: 'text',
  unique: true,
  index: true,
  admin: { position: 'sidebar', description: 'Filled from the title if left empty.' },
  hooks: {
    beforeValidate: [({ value, data }) => (value ? toSlug(String(value)) : data?.[from] ? toSlug(String(data[from])) : value)],
  },
})
