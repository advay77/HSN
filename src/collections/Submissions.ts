import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { enrollmentActivity, membershipActivity, registrationActivity } from './hooks/activity'

// Certificate numbers: when a course is completed, the enrollment gets the next number (highest so far + 1).
// Numbers start again at 1 after an admin restarts the numbering (Admin → Certificates), which sets earlier ones to 0.
const assignCertificateNo: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const completed = data.completedAt ?? originalDoc?.completedAt
  const current = data.certificateNo ?? originalDoc?.certificateNo
  if (!completed || (current !== null && current !== undefined)) return data
  const top = await req.payload.find({ collection: 'enrollments', where: { certificateNo: { greater_than: 0 } }, sort: '-certificateNo', limit: 1, depth: 0, req, overrideAccess: true })
  data.certificateNo = (top.docs[0]?.certificateNo ?? 0) + 1
  return data
}

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
    {
      name: 'certificateNo',
      label: 'Certificate number',
      type: 'number',
      index: true,
      admin: { readOnly: true, description: 'Given automatically when the course is completed: 1, 2, 3… (0 = issued before the numbering was restarted).' },
    },
  ],
  hooks: { beforeChange: [assignCertificateNo], afterChange: [enrollmentActivity] },
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

// Course completion delegate feedback. One response per member per course.
export const CourseFeedback: CollectionConfig = {
  slug: 'course-feedback',
  admin: {
    useAsTitle: 'delegateName',
    defaultColumns: ['delegateName', 'courseTitle', 'overallSatisfaction', 'recommend', 'createdAt'],
    group: 'Inbox',
  },
  fields: [
    { name: 'delegateName', label: 'Delegate name', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'completionDate', label: 'Completion date', type: 'date' },
    { name: 'courseTitle', label: 'Course title', type: 'text', required: true },
    { name: 'course', type: 'relationship', relationTo: 'courses', index: true },
    { name: 'member', type: 'relationship', relationTo: 'members', index: true },
    {
      name: 'overallSatisfaction',
      label: 'Overall satisfaction',
      type: 'select',
      required: true,
      options: [
        { label: 'Excellent', value: 'excellent' },
        { label: 'Good', value: 'good' },
        { label: 'Average', value: 'average' },
        { label: 'Below Average', value: 'below-average' },
        { label: 'Poor', value: 'poor' },
      ],
    },
    {
      name: 'recommend',
      label: 'Would recommend',
      type: 'select',
      required: true,
      options: [
        { label: 'Yes, definitely', value: 'yes' },
        { label: 'Maybe', value: 'maybe' },
        { label: 'No', value: 'no' },
      ],
    },
    { name: 'objectivesClear', label: 'Learning objectives were clear and met', type: 'number', required: true, min: 1, max: 5 },
    { name: 'contentRelevant', label: 'Content was relevant to their role', type: 'number', required: true, min: 1, max: 5 },
    { name: 'structuredLogically', label: 'Topics were structured logically', type: 'number', required: true, min: 1, max: 5 },
    { name: 'lengthPace', label: 'Length and pace were appropriate', type: 'number', required: true, min: 1, max: 5 },
    { name: 'examplesHelpful', label: 'Examples and case studies were helpful', type: 'number', required: true, min: 1, max: 5 },
    { name: 'platformEasy', label: 'Platform was easy to navigate', type: 'number', required: true, min: 1, max: 5 },
    { name: 'mediaClear', label: 'Video, audio and visuals were clear', type: 'number', required: true, min: 1, max: 5 },
    { name: 'quizzesHelpful', label: 'Quizzes reinforced learning', type: 'number', required: true, min: 1, max: 5 },
    { name: 'takeaway', label: 'Most valuable takeaway', type: 'textarea' },
    { name: 'application', label: 'How they will apply it', type: 'textarea' },
    { name: 'futureTopics', label: 'Topics they want next', type: 'textarea' },
    { name: 'comments', label: 'Additional comments', type: 'textarea' },
    { name: 'sharePublicly', label: 'Learner agreed to show their feedback on the website', type: 'checkbox', defaultValue: false },
    { name: 'showOnSite', label: 'Shown on the course page', type: 'checkbox', defaultValue: false },
  ],
  timestamps: true,
}

// Website feedback form shown on Home, About and /feedback. Anyone can send it; admins read it in Admin → Feedback.
export const SiteFeedback: CollectionConfig = {
  slug: 'site-feedback',
  admin: {
    useAsTitle: 'message',
    defaultColumns: ['name', 'rating', 'message', 'page', 'createdAt'],
    group: 'Inbox',
  },
  fields: [
    { name: 'name', type: 'text' },
    { name: 'email', type: 'email' },
    {
      name: 'rating',
      type: 'select',
      options: [
        { label: 'Excellent', value: '5' },
        { label: 'Good', value: '4' },
        { label: 'Okay', value: '3' },
        { label: 'Poor', value: '2' },
        { label: 'Very poor', value: '1' },
      ],
    },
    { name: 'aspects', label: 'Ratings by area (1 to 5)', type: 'json' },
    { name: 'nps', label: 'Likely to recommend (0 to 10)', type: 'number', min: 0, max: 10 },
    { name: 'liked', label: 'What they liked most', type: 'textarea' },
    { name: 'message', label: 'What we should improve', type: 'textarea', required: true },
    { name: 'wants', label: 'Would like to see', type: 'json' },
    { name: 'role', type: 'text' },
    { name: 'source', label: 'How they found HSN', type: 'text' },
    { name: 'contactOk', label: 'Happy to be contacted', type: 'checkbox', defaultValue: false },
    { name: 'page', label: 'Sent from page', type: 'text' },
    { name: 'member', type: 'relationship', relationTo: 'members' },
    { name: 'read', label: 'Read by HSN', type: 'checkbox', defaultValue: false },
  ],
  timestamps: true,
}
