import type { CollectionConfig } from 'payload'

// What members do on the site: logins, course progress, submissions. Feeds the admin Overview
// (logins per day, live activity) and the member detail timeline. Written by the app, never by hand.
export const Activity: CollectionConfig = {
  slug: 'activity',
  admin: { group: 'People', useAsTitle: 'type', defaultColumns: ['type', 'member', 'detail', 'createdAt'] },
  defaultSort: '-createdAt',
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Logged in', value: 'login' },
        { label: 'Signed up', value: 'signup' },
        { label: 'Completed a lesson', value: 'lesson' },
        { label: 'Passed a quiz', value: 'quiz-pass' },
        { label: 'Completed a course', value: 'course-complete' },
        { label: 'Registered for a course', value: 'course-registration' },
        { label: 'Submitted a case study', value: 'case-submitted' },
        { label: 'Membership sign-up', value: 'membership' },
      ],
    },
    { name: 'member', type: 'relationship', relationTo: 'members', index: true },
    { name: 'detail', type: 'text', admin: { description: 'e.g. course or case study title' } },
    // Logins only: { method, device, location } for the member's login history.
    { name: 'meta', type: 'json', admin: { readOnly: true } },
  ],
  timestamps: true,
}

// Page views with time spent, for "Most viewed sections". One row per page visit.
export const PageViews: CollectionConfig = {
  slug: 'page-views',
  admin: { hidden: true },
  fields: [
    { name: 'section', type: 'text', required: true, index: true },
    { name: 'path', type: 'text' },
    { name: 'seconds', type: 'number', defaultValue: 0 },
    { name: 'member', type: 'relationship', relationTo: 'members', index: true },
    { name: 'visitor', type: 'text', index: true },
  ],
  timestamps: true,
}
