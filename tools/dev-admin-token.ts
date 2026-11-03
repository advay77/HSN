// Dev only: prints an hsn_admin cookie value for the first admin account, so tools/compare.mjs can open
// admin pages. Usage: npx payload run tools/dev-admin-token.ts
import config from '@payload-config'
import { SignJWT } from 'jose'
import { getPayload } from 'payload'

if (process.env.NODE_ENV === 'production') throw new Error('dev only')
const payload = await getPayload({ config })
const user = (await payload.find({ collection: 'users', limit: 1, depth: 0 })).docs[0]
if (!user) throw new Error('No admin account yet: sign in once at /login?admin=1')
const key = new TextEncoder().encode(`admin:${process.env.PAYLOAD_SECRET || ''}`)
const token = await new SignJWT({ sub: String(user.id), v: user.sessionVersion ?? 0 })
  .setProtectedHeader({ alg: 'HS256' })
  .setAudience('hsn-admin')
  .setIssuedAt()
  .setExpirationTime('2h')
  .sign(key)
console.log(`HSN_ADMIN_TOKEN=${token}`)
process.exit(0)
