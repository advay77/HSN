import { getAdmin } from '@/lib/admin/auth'
import { findMembers } from '@/lib/admin/members'
import { csvResponse, fmtDate, fmtHM, STATUS_LABEL, TIER_LABEL, todayStamp } from '@/lib/admin/people'

// CSV of the members list with the same filters and order as the page.
export async function GET(req: Request) {
  if (!(await getAdmin())) return new Response('Not signed in', { status: 401 })
  const sp = Object.fromEntries(new URL(req.url).searchParams)
  const { rows } = await findMembers(sp)
  return csvResponse(
    `hsn-members-${todayStamp()}.csv`,
    ['Name', 'Email', 'Phone', 'Role', 'Organization', 'Country', 'Tier', 'Membership status', 'Joined', 'Last login', 'Blocked', 'Most viewed', 'Time on site', 'Courses completed'],
    rows.map((r) => [
      r.name,
      r.email,
      r.phone,
      r.role,
      r.org,
      r.country,
      r.tier ? TIER_LABEL[r.tier] : '',
      r.status ? STATUS_LABEL[r.status] : '',
      fmtDate(r.joined),
      r.lastLoginAt ? new Date(r.lastLoginAt).toISOString() : '',
      r.blocked ? 'Yes' : 'No',
      r.top === '—' ? '' : r.top,
      fmtHM(r.seconds),
      r.completed,
    ]),
  )
}
