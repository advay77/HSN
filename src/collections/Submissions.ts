import type { CollectionConfig } from 'payload'

import { enrollmentActivity, membershipActivity, registrationActivity } from './hooks/activity'

// Course progress per member: which lessons are done, quiz results, completion.
export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['member', 'course', 'progress', 'completedAt'],
    group: 'People',
  },
  fields: [
    { name: 'member', type: 'relationship', relationTo: 'members', required: true, index: true },
    { name: 'course', type: 'relationship', relationTo: 'courses', required: true, index: true },
    { name: 'completedLessons', type: 'json', admin: { description: 'Lesson ids the member has completed.' } },
    { name: 'quizResults', type: 'json' },
    { name: 'progress', label: 'Progress (%)', type: 'number', defaultValue: 0 },
    { name: 'savedForLater', type: 'checkbox', defaultValue: false },
    { name: 'completedAt', type: 'date' },
  ],
  hooks: { afterChange: [enrollmentActivity] },
  timestamps: true,
}

// "Register for this course" form (Register page).
export const CourseRegistrations: CollectionConfig = {
  slug: 'course-registrations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'course', 'createdAt'],
    group: 'Inbox',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    { name: 'role', type: 'text' },
    { name: 'organization', type: 'text' },
    { name: 'country', type: 'text' },
    { name: 'session', label: 'Session / preferred date', type: 'text' },
    { name: 'joinNetwork', label: 'Add to the HSN WhatsApp/LinkedIn Network', type: 'checkbox', defaultValue: false },
    { name: 'course', type: 'relationship', relationTo: 'courses' },
    { name: 'member', type: 'relationship', relationTo: 'members' },
  ],
  hooks: { afterChange: [registrationActivity] },
  timestamps: true,
}

// Membership page form. While membership is free this records the sign-up; when a payment provider is
// configured the same record tracks the payment (see src/lib/payments).
export const MembershipApplications: CollectionConfig = {
  slug: 'membership-applications',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'tier', 'region', 'paymentStatus', 'createdAt'],
    group: 'Inbox',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'organization', type: 'text' },
    { name: 'role', type: 'text' },
    {
      type: 'row',
      fields: [
        {
          name: 'tier',
          type: 'select',
          required: true,
          options: [
            { label: 'Student', value: 'student' },
            { label: 'Individual Professional', value: 'individual' },
            { label: 'Institutional', value: 'institutional' },
          ],
        },
        { name: 'country', type: 'text' },
        { name: 'region', label: 'Pricing region', type: 'text' },
      ],
    },
    { name: 'message', type: 'textarea' },
    { name: 'member', type: 'relationship', relationTo: 'members' },
    {
      type: 'row',
      fields: [
        {
          name: 'paymentStatus',
          type: 'select',
          defaultValue: 'free',
          options: [
            { label: 'Free (no payment)', value: 'free' },
            { label: 'Awaiting payment', value: 'pending' },
            { label: 'Paid', value: 'paid' },
            { label: 'Failed', value: 'failed' },
          ],
        },
        { name: 'paymentProvider', type: 'text', admin: { readOnly: true } },
        { name: 'paymentReference', type: 'text', admin: { readOnly: true } },
      ],
    },
  ],
  hooks: { afterChange: [membershipActivity] },
  timestamps: true,
}
