import { getAdmin } from '@/lib/admin/auth'
import { findInterest } from '@/lib/admin/inbox'
import { csvResponse, TIER_LABEL, todayStamp } from '@/lib/admin/people'

// CSV of membership interest entries with the page's current filters.
export async function GET(req: Request) {
  if (!(await getAdmin())) return new Response('Not signed in', { status: 401 })
  const sp = Object.fromEntries(new URL(req.url).searchParams)
  const { rows } = await findInterest(sp)
  return csvResponse(
    `hsn-membership-interest-${todayStamp()}.csv`,
    ['Name', 'Email', 'Organization', 'Role', 'Country', 'Pricing region', 'Tier', 'Payment', 'Message', 'Submitted'],
    rows.map((r) => [r.name, r.email, r.org, r.role, r.country, r.region, TIER_LABEL[r.tier] ?? r.tier, r.payment, r.message, new Date(r.createdAt).toISOString()]),
  )
}
