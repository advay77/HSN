// Creates or updates the HSN admin panel account from .env (ADMIN_EMAIL, ADMIN_PASSWORD).
// Run after changing either value: npx payload run scripts/create-admin.ts
import config from '@payload-config'
import { getPayload } from 'payload'

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD || ''
if (!email || password.length < 12) throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters in .env')

const payload = await getPayload({ config })
const existing = (await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, depth: 0 })).docs[0]
if (existing) {
  await payload.update({ collection: 'users', id: existing.id, data: { password, loginAttempts: 0, lockUntil: null } })
  console.log(`Updated the password for ${email}`)
} else {
  await payload.create({ collection: 'users', data: { email, password, name: 'HSN Admin' } })
  console.log(`Created admin account ${email}`)
}
process.exit(0)
