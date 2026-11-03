import type { CollectionConfig } from 'payload'

// Admin panel accounts (HSN founder and team). Learners are in `members`, not here.
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Admin', plural: 'Admins' },
  admin: {
    useAsTitle: 'email',
    group: 'Settings',
  },
  // Lock the account for 10 minutes after 5 wrong passwords.
  auth: { maxLoginAttempts: 5, lockTime: 10 * 60 * 1000 },
  fields: [
    { name: 'name', type: 'text' },
    // Bumped on log-out and password change so every existing admin session cookie stops working.
    { name: 'sessionVersion', type: 'number', defaultValue: 0, admin: { hidden: true } },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        if (operation === 'update' && data.password) data.sessionVersion = (originalDoc?.sessionVersion ?? 0) + 1
        return data
      },
    ],
  },
}
