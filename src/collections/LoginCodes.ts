import type { CollectionConfig } from 'payload'

// One-time sign-in codes sent by email. Only the hash is stored. Hidden from the admin panel.
export const LoginCodes: CollectionConfig = {
  slug: 'login-codes',
  admin: { hidden: true },
  fields: [
    { name: 'email', type: 'email', required: true, index: true },
    // Member codes and admin-panel codes never unlock each other.
    {
      name: 'scope',
      type: 'select',
      defaultValue: 'member',
      index: true,
      options: [
        { label: 'Member', value: 'member' },
        { label: 'Admin', value: 'admin' },
      ],
    },
    { name: 'codeHash', type: 'text', required: true },
    { name: 'expiresAt', type: 'date', required: true },
    { name: 'attempts', type: 'number', defaultValue: 0 },
    { name: 'used', type: 'checkbox', defaultValue: false },
    // Sign-up details held until the code is verified, then copied to the new member.
    { name: 'name', type: 'text' },
    { name: 'joinNetwork', type: 'checkbox', defaultValue: false },
  ],
}
