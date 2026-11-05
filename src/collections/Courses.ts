import type { CollectionConfig } from 'payload'

import { slugField } from './fields/slug'

// One course = the Course page (hero, facts, outcomes, modules, certificate) plus its lessons for the Player.
// Mirrors the five tabs of the AdminCourses design: Basics, What you'll learn, Modules & lessons, Certificate, Publishing.
export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'level', 'kind', 'published', 'featured'],
    group: 'Content',
  },
  defaultSort: 'order',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Basics',
          fields: [
            { name: 'title', type: 'text', required: true },
            slugField('title'),
            { name: 'description', type: 'textarea', required: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'level',
                  type: 'select',
                  required: true,
                  defaultValue: 'Beginner',
                  options: ['Beginner', 'Intermediate', 'Advanced'],
                },
                {
                  name: 'kind',
                  label: 'Course type',
                  type: 'select',
                  required: true,
                  defaultValue: 'Full course',
                  options: ['Full course', 'Micro-course'],
                },
                { name: 'createdBy', type: 'text', defaultValue: 'Healthcare Sustainability Network' },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'access',
                  label: 'Access (first tag above the title)',
                  type: 'select',
                  required: true,
                  defaultValue: 'open',
                  options: [
                    { label: 'Open access', value: 'open' },
                    { label: 'Paid access', value: 'paid' },
                  ],
                },
                { name: 'tagRegistration', label: 'Show "Registration" tag', type: 'checkbox', defaultValue: true },
                { name: 'tagSelfPaced', label: 'Show "Self-paced" tag', type: 'checkbox', defaultValue: true },
                {
                  name: 'tagVideo',
                  label: 'Show "Contains video" tag',
                  type: 'checkbox',
                  admin: { description: 'Left unset, the tag shows when the course has a video lesson.' },
                },
              ],
            },
            { name: 'tags', type: 'array', fields: [{ name: 'label', type: 'text', required: true }] },
            { name: 'cover', label: 'Cover image', type: 'upload', relationTo: 'media' },
            {
              name: 'coverBadge',
              label: 'Label on the image',
              type: 'text',
              admin: { description: 'e.g. "Free for members". Left unset, the site shows "Free course" or "Free for members".' },
            },
            {
              name: 'coverColor',
              label: 'Card colour (used when there is no cover image)',
              type: 'select',
              defaultValue: '#134E5E',
              options: [
                { label: 'Dark teal', value: '#134E5E' },
                { label: 'Deep green', value: '#0B6B3A' },
                { label: 'Leaf green', value: '#4FAE4E' },
                { label: 'Light aqua', value: '#DDF0F6' },
                { label: 'Light green', value: '#E3F1E4' },
              ],
            },
            {
              name: 'facts',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'duration', type: 'text', admin: { description: 'e.g. "About 2 hours"' } },
                    { name: 'language', type: 'text', defaultValue: 'English' },
                    { name: 'languageNote', type: 'text', defaultValue: 'Hindi and Arabic coming soon' },
                  ],
                },
              ],
            },
            {
              name: 'sessions',
              label: 'Live sessions (cohorts / webinars)',
              type: 'array',
              admin: { description: 'Optional. Shown as choices on the course registration form.' },
              fields: [{ name: 'label', type: 'text', required: true, admin: { description: 'e.g. "Cohort · 12 Jan 2027"' } }],
            },
          ],
        },
        {
          label: "What you'll learn",
          fields: [
            { name: 'learnIntro', label: 'Intro line', type: 'textarea' },
            { name: 'outcomes', type: 'array', fields: [{ name: 'text', type: 'text', required: true }] },
            { name: 'skills', type: 'array', fields: [{ name: 'label', type: 'text', required: true }] },
            {
              name: 'about',
              label: 'About this course',
              type: 'textarea',
              admin: { description: 'The first paragraph is shown larger. Separate paragraphs with a blank line.' },
            },
          ],
        },
        {
          label: 'Modules & lessons',
          fields: [
            {
              name: 'modules',
              type: 'array',
              admin: { initCollapsed: true },
              fields: [
                { name: 'title', type: 'text', required: true },
                {
                  name: 'status',
                  type: 'select',
                  required: true,
                  defaultValue: 'available',
                  options: [
                    { label: 'Available', value: 'available' },
                    { label: 'Coming soon', value: 'coming-soon' },
                    { label: 'Hidden', value: 'hidden' },
                  ],
                },
                { name: 'slides', label: 'Slides file (download for learners)', type: 'upload', relationTo: 'media' },
                {
                  name: 'lessons',
                  type: 'array',
                  admin: { initCollapsed: true },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'title', type: 'text', required: true },
                        {
                          name: 'type',
                          type: 'select',
                          required: true,
                          defaultValue: 'text',
                          options: [
                            { label: 'Cover slide', value: 'cover' },
                            { label: 'Slide (text)', value: 'text' },
                            { label: 'Reflection', value: 'reflection' },
                            { label: 'Diagram (image)', value: 'diagram' },
                            { label: 'Video', value: 'video' },
                            { label: 'Reading / references', value: 'references' },
                            { label: 'Tutorial file', value: 'document' },
                            { label: 'Module summary', value: 'summary' },
                            { label: 'Quiz', value: 'quiz' },
                          ],
                        },
                      ],
                    },
                    { name: 'body', type: 'textarea' },
                    {
                      name: 'extra',
                      label: 'Follow-up line',
                      type: 'text',
                      admin: { condition: (_, s) => s?.type === 'reflection' },
                    },
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      admin: { condition: (_, s) => s?.type === 'diagram' || s?.type === 'cover' },
                    },
                    {
                      name: 'file',
                      label: 'Tutorial file (Word, PDF, and similar)',
                      type: 'upload',
                      relationTo: 'media',
                      admin: { condition: (_, s) => s?.type === 'document' },
                    },
                    {
                      name: 'youtubeId',
                      label: 'YouTube video ID or link',
                      type: 'text',
                      admin: { condition: (_, s) => s?.type === 'video' },
                    },
                    {
                      name: 'references',
                      type: 'array',
                      admin: { condition: (_, s) => s?.type === 'references' },
                      fields: [
                        { name: 'text', type: 'textarea', required: true },
                        { name: 'url', type: 'text' },
                        { name: 'linkText', label: 'Link text (optional)', type: 'text' },
                      ],
                    },
                    {
                      name: 'draftQuestions',
                      label: 'Show "Draft questions · HSN to confirm" badge',
                      type: 'checkbox',
                      defaultValue: false,
                      admin: { condition: (_, s) => s?.type === 'quiz' },
                    },
                    {
                      name: 'questions',
                      type: 'array',
                      admin: { condition: (_, s) => s?.type === 'quiz' },
                      fields: [
                        { name: 'question', type: 'text', required: true },
                        {
                          name: 'options',
                          type: 'array',
                          minRows: 2,
                          fields: [
                            {
                              type: 'row',
                              fields: [
                                { name: 'text', type: 'text', required: true },
                                { name: 'correct', type: 'checkbox', defaultValue: false },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Certificate',
          fields: [
            {
              name: 'certificate',
              type: 'group',
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: true },
                { name: 'heading', type: 'text', admin: { description: 'Default: "Earn Your HSN Certificate"' } },
                { name: 'text', label: 'Certificate text', type: 'textarea' },
                {
                  type: 'row',
                  fields: [
                    { name: 'step1', label: 'Step 1', type: 'text', admin: { description: 'Default: "Complete every lesson"' } },
                    { name: 'step2', label: 'Step 2', type: 'text', admin: { description: 'Default: "Pass each module quiz"' } },
                    { name: 'step3', label: 'Step 3', type: 'text', admin: { description: 'Default: "Download and share"' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'passMark', label: 'Quiz pass mark (%)', type: 'number', defaultValue: 80, min: 0, max: 100 },
                    { name: 'retakes', label: 'Quiz retakes allowed', type: 'checkbox', defaultValue: true },
                    {
                      name: 'maxAttempts',
                      label: 'Attempts per quiz (0 = unlimited)',
                      type: 'number',
                      defaultValue: 0,
                      min: 0,
                    },
                    { name: 'issuer', type: 'text', defaultValue: 'Healthcare Sustainability Network' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Publishing',
          fields: [
            { name: 'published', type: 'checkbox', defaultValue: false },
            { name: 'featured', type: 'checkbox', defaultValue: false },
            {
              name: 'audience',
              type: 'select',
              defaultValue: 'everyone',
              options: [
                { label: 'Everyone (free account)', value: 'everyone' },
                { label: 'Members only', value: 'members' },
              ],
            },
            { name: 'order', type: 'number', defaultValue: 0, admin: { description: 'Lower numbers show first.' } },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
