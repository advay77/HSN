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

// Page views with time spent, for "Most viewed sections" and each member's journey. One row per page visit.
export const PageViews: CollectionConfig = {
  slug: 'page-views',
  admin: { hidden: true },
  fields: [
    { name: 'section', type: 'text', required: true, index: true },
    { name: 'path', type: 'text' },
    { name: 'seconds', type: 'number', defaultValue: 0 },
    { name: 'member', type: 'relationship', relationTo: 'members', index: true },
    { name: 'visitor', type: 'text', index: true },
    // The page on this site the person came from (empty on the first page of a visit).
    { name: 'from', type: 'text' },
    // Where a visit started from outside the site: a site name such as "google.com", or empty for direct.
    { name: 'referrer', type: 'text', index: true },
  ],
  timestamps: true,
}

// Clicks on links and buttons (their visible label and where a link goes). Never what anyone types.
export const ClickEvents: CollectionConfig = {
  slug: 'click-events',
  admin: { hidden: true },
  fields: [
    { name: 'path', type: 'text', required: true, index: true },
    { name: 'label', type: 'text', required: true },
    { name: 'target', type: 'text' },
    { name: 'kind', type: 'select', options: ['link', 'button'], defaultValue: 'link' },
    { name: 'member', type: 'relationship', relationTo: 'members', index: true },
    { name: 'visitor', type: 'text', index: true },
  ],
  timestamps: true,
}
