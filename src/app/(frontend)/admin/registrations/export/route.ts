import { getAdmin } from '@/lib/admin/auth'
import { findRegistrations } from '@/lib/admin/inbox'
import { csvResponse, todayStamp } from '@/lib/admin/people'

// CSV of course registrations with the page's current filters.
export async function GET(req: Request) {
  if (!(await getAdmin())) return new Response('Not signed in', { status: 401 })
  const sp = Object.fromEntries(new URL(req.url).searchParams)
  const { rows } = await findRegistrations(sp)
  return csvResponse(
    `hsn-course-registrations-${todayStamp()}.csv`,
    ['Name', 'Email', 'Phone', 'Job title / role', 'Organization', 'Country', 'Course', 'Session', 'Join network', 'Submitted'],
    rows.map((r) => [r.name, r.email, r.phone, r.role, r.org, r.country, r.course, r.session, r.net ? 'Yes' : 'No', new Date(r.createdAt).toISOString()]),
  )
}
