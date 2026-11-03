import type { CollectionConfig } from 'payload'

import { memberActivity } from './hooks/activity'

// Learners and members of the public site. They sign in with Google or an emailed one-time code
// (see src/lib/auth), not with the admin panel's password login.
export const Members: CollectionConfig = {
  slug: 'members',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'membershipTier', 'membershipStatus', 'lastLoginAt'],
    group: 'People',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, unique: true, index: true },
    {
      type: 'row',
      fields: [
        { name: 'phoneCountryCode', label: 'Country code', type: 'text', admin: { width: '30%' } },
        { name: 'phone', type: 'text' },
      ],
    },
    { name: 'role', label: 'Role / job title', type: 'text' },
    { name: 'organization', type: 'text' },
    { name: 'country', type: 'text' },
    {
      name: 'joinNetwork',
      label: 'Asked to be added to the HSN WhatsApp/LinkedIn Network',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'membershipTier',
          type: 'select',
          options: [
            { label: 'Student', value: 'student' },
            { label: 'Individual Professional', value: 'individual' },
            { label: 'Institutional', value: 'institutional' },
          ],
        },
        {
          name: 'membershipStatus',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'Not a member', value: 'none' },
            { label: 'Pending payment', value: 'pending' },
            { label: 'Active', value: 'active' },
            { label: 'Expired', value: 'expired' },
          ],
        },
      ],
    },
    {
      name: 'authProvider',
      type: 'select',
      options: [
        { label: 'Google', value: 'google' },
        { label: 'Email code', value: 'email' },
      ],
      admin: { readOnly: true },
    },
    { name: 'googleId', type: 'text', index: true, admin: { readOnly: true, hidden: true } },
    { name: 'lastLoginAt', type: 'date', admin: { readOnly: true } },
    // How the last sign-in happened; copied into the login activity row (admin login history).
    {
      name: 'lastLoginMethod',
      type: 'select',
      options: [
        { label: 'Google', value: 'google' },
        { label: 'Email code', value: 'email' },
      ],
      admin: { readOnly: true },
    },
    // Updated by the page-view beacon; "online now" = seen in the last 5 minutes.
    { name: 'lastSeenAt', type: 'date', index: true, admin: { readOnly: true } },
    // Bumped on log-out so every existing session cookie for this member stops working.
    { name: 'sessionVersion', type: 'number', defaultValue: 0, admin: { hidden: true } },
    {
      name: 'blocked',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Blocked members cannot sign in.' },
    },
    { name: 'adminNote', label: 'Private note (admins only)', type: 'textarea' },
  ],
  hooks: { afterChange: [memberActivity] },
  timestamps: true,
}
