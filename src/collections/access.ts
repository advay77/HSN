import type { Access } from 'payload'

// The public site reads data through the server. Visitors cannot use the database API directly.
export const adminOnly: Access = ({ req }) => Boolean(req.user)

export const staffOnly = {
  create: adminOnly,
  read: adminOnly,
  update: adminOnly,
  delete: adminOnly,
}
