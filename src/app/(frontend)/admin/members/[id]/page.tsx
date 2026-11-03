// Ported from AdminMember.dc.html. Profile, usage, login history and courses for one real member, plus a
// membership/notes card and their registrations and case studies (not on the board; same card styles).
import { notFound } from 'next/navigation'
import React from 'react'

import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { MemberActions, MembershipForm } from '@/components/admin/MemberDetailClient'
import { requireAdmin } from '@/lib/admin/auth'
import { fmtAgo, fmtDate, fmtDateTime, fmtHM, fmtSession, fmtTime, isOnline, STATUS_LABEL, TIER_CLS, TIER_LABEL } from '@/lib/admin/people'
import { initialsOf } from '@/lib/auth/session'
import { getPayloadClient } from '@/lib/payload'
import { buildJourneys } from '@/lib/admin/journey'
import { countVisits, plural, visitsBySection } from '@/lib/admin/visits'

export const metadata = { title: 'Member' }

const DAY = 86400000
const titleOf = (v: unknown) => (v && typeof v === 'object' ? (v as { title?: string }).title : undefined)

const WHAT: Record<string, (d?: string | null) => string> = {
  login: () => 'Logged in',
  signup: () => 'Joined HSN',
  lesson: (d) => (d ? `Completed a lesson in ${d}` : 'Completed a lesson'),
  'quiz-pass': (d) => (d ? `Passed a quiz in ${d}` : 'Passed a quiz'),
  'course-complete': (d) => (d ? `Completed ${d}` : 'Completed a course'),
  'course-registration': (d) => (d ? `Registered for ${d}` : 'Registered for a course'),
  'case-submitted': (d) => (d ? `Submitted case study: ${d}` : 'Submitted a case study'),
  membership: (d) => `Registered for ${TIER_LABEL[d ?? ''] ?? 'a'} membership`,
}
const CASE_STATUS: Record<string, [string, string]> = {
  submitted: ['Awaiting review', 'bdg b-warn'],
  draft: ['Draft', 'bdg b-reg'],
  published: ['Published', 'bdg b-ok'],
  rejected: ['Returned', 'bdg b-err'],
}
const METHOD: Record<string, string> = { email: 'Email code', google: 'Google' }

export default async function AdminMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await requireAdmin(`/admin/members/${id}`)
  const mid = Number(id)
  if (!Number.isInteger(mid) || mid <= 0) notFound()
  const payload = await getPayloadClient()
  const m = await payload.findByID({ collection: 'members', id: mid, depth: 0 }).catch(() => null)
  if (!m) notFound()

  const byMember = { member: { equals: mid } }
  const monthAgo = new Date(Date.now() - 30 * DAY).toISOString()
  const [views, recent, logins, logins30, enrollments, regs, cases] = await Promise.all([
    payload.find({ collection: 'page-views', where: byMember, pagination: false, depth: 0, select: { section: true, seconds: true, createdAt: true, visitor: true, path: true, referrer: true } }),
    payload.find({ collection: 'activity', where: byMember, sort: '-createdAt', limit: 8, depth: 0 }),
    payload.find({ collection: 'activity', where: { and: [byMember, { type: { equals: 'login' } }] }, sort: '-createdAt', limit: 10, depth: 0 }),
    payload.count({ collection: 'activity', where: { and: [byMember, { type: { equals: 'login' } }, { createdAt: { greater_than: monthAgo } }] } }),
    payload.find({ collection: 'enrollments', where: byMember, sort: '-updatedAt', pagination: false, depth: 1 }),
    payload.find({
      collection: 'course-registrations',
      where: { or: [byMember, { email: { equals: m.email } }] },
      sort: '-createdAt',
      pagination: false,
      depth: 1,
    }),
    payload.find({ collection: 'case-studies', where: { 'submittedBy.email': { equals: m.email } }, sort: '-createdAt', pagination: false, depth: 0 }),
  ])

  // Pages this person opened in the same browser before logging in count towards their visits too.
  const cookies = [...new Set(views.docs.map((v) => v.visitor).filter((v): v is string => !!v))]
  const beforeLogin = cookies.length
    ? await payload.find({
        collection: 'page-views',
        where: { and: [{ visitor: { in: cookies } }, { member: { exists: false } }] },
        pagination: false,
        depth: 0,
        select: { section: true, seconds: true, createdAt: true, visitor: true, path: true, referrer: true },
      })
    : { docs: [] }
  const allViews = [...views.docs, ...beforeLogin.docs]
  const clickRows = await payload.find({
    collection: 'click-events',
    where: cookies.length ? { or: [byMember, { and: [{ visitor: { in: cookies } }, { member: { exists: false } }] }] } : byMember,
    pagination: false,
    depth: 0,
    select: { createdAt: true, path: true, label: true, target: true },
  })
  const journeys = buildJourneys(allViews, clickRows.docs)

  const online = isOnline(m.lastSeenAt)
  const totalSeconds = views.docs.reduce((s, v) => s + (v.seconds ?? 0), 0)
  const bySection = new Map<string, number>()
  for (const v of views.docs) bySection.set(v.section, (bySection.get(v.section) ?? 0) + (v.seconds ?? 0))
  const sections = [...bySection.entries()].filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).slice(0, 7)
  const sectionVisits = visitsBySection(allViews)
  const visitsAll = countVisits(allViews)
  const visits30 = countVisits(allViews.filter((v) => v.createdAt > monthAgo))
  const lastVisit = allViews.reduce<string | null>((a, v) => (!a || v.createdAt > a ? v.createdAt : a), null)
  const topSeconds = sections[0]?.[1] ?? 1
  const completed = enrollments.docs.filter((e) => e.completedAt)

  // A session = time on pages between this login and the next one.
  const loginRows = logins.docs.map((l, i) => {
    const start = new Date(l.createdAt).getTime()
    const end = i === 0 ? Date.now() : new Date(logins.docs[i - 1]!.createdAt).getTime()
    const secs = views.docs.filter((v) => {
      const t = new Date(v.createdAt).getTime()
      return t >= start && t < end
    }).reduce((s, v) => s + (v.seconds ?? 0), 0)
    const meta = (l.meta ?? {}) as { method?: string; device?: string; location?: string }
    return {
      id: l.id,
      d: fmtDateTime(l.createdAt),
      m: METHOD[meta.method ?? ''] ?? '—',
      dev: meta.device || '—',
      loc: meta.location || '—',
      s: i === 0 && online ? 'Active now' : secs ? fmtSession(secs) : '—',
    }
  })

  const tierBadge = m.membershipTier
    ? { cls: TIER_CLS[m.membershipTier]!, label: TIER_LABEL[m.membershipTier]! + (m.membershipStatus && m.membershipStatus !== 'active' ? ` · ${STATUS_LABEL[m.membershipStatus]}` : '') }
    : { cls: 'bdg b-reg', label: 'Not a member' }
  const phone = [m.phoneCountryCode, m.phone].filter(Boolean).join(' ')
  const orgLine = [m.organization, m.country].filter(Boolean).join(' · ')

  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        rightTag="span"
        rightClass="row g8"
        left={<div className="stack g4"><nav className="crumbs" aria-label="Breadcrumb"><a href="/admin/members">Members</a><span aria-hidden="true">/</span><span aria-current="page">{m.name}</span></nav></div>}
      />
      <main className="amain">
        <section className="card pad row between g24 top" aria-label="Profile">
          <div className="row g20 top">
            <span className="avatar" style={{ width: '72px', height: '72px', fontSize: '24px' }}>{initialsOf(m.name)}</span>
            <div className="stack g8">
              <h1 className="h2" style={{ margin: 0 }}>{m.name}</h1>
              <div className="row g8">
                <span className={tierBadge.cls}>{tierBadge.label}</span>
                {m.blocked ? (
                  <span className="bdg b-err"><span className="dot blk"></span>Blocked</span>
                ) : online ? (
                  <span className="bdg b-ok"><span className="dot"></span>Online now</span>
                ) : (
                  <span className="bdg b-reg"><span className="dot off"></span>Last seen {fmtAgo(m.lastSeenAt ?? m.lastLoginAt).toLowerCase()}</span>
                )}
              </div>
              <dl className="grid c2" style={{ gap: '6px 32px', marginTop: '6px' }}>
                <div className="row g8"><dt className="small muted strong">Email</dt><dd className="small">{m.email}</dd></div>
                <div className="row g8"><dt className="small muted strong">Phone</dt><dd className="small">{phone || '—'}</dd></div>
                <div className="row g8"><dt className="small muted strong">Role</dt><dd className="small">{m.role || '—'}</dd></div>
                <div className="row g8"><dt className="small muted strong">Organization</dt><dd className="small">{orgLine || '—'}</dd></div>
                <div className="row g8"><dt className="small muted strong">Joined</dt><dd className="small">{fmtDate(m.createdAt)}</dd></div>
                <div className="row g8"><dt className="small muted strong">Community</dt><dd className="small">{m.joinNetwork ? 'WhatsApp and LinkedIn' : 'Not joined'}</dd></div>
              </dl>
            </div>
          </div>
          <MemberActions id={m.id} name={m.name} email={m.email} blocked={!!m.blocked} />
        </section>
        <div className="grid c5" style={{ gap: '16px' }}>
          <div className="kpi kpi-wide"><span className="small strong muted">Visits</span><span className="kpi-n">{visitsAll}</span><span className="small muted">{visits30} in the last 30 days{lastVisit ? ` · last ${fmtAgo(lastVisit).toLowerCase()}` : ''}</span></div>
          <div className="kpi"><span className="small strong muted">Time on site</span><span className="kpi-n">{fmtHM(totalSeconds)}</span>{visitsAll ? <span className="small muted">{fmtHM(Math.round(totalSeconds / visitsAll))} per visit</span> : null}</div>
          <div className="kpi"><span className="small strong muted">Logins, last 30 days</span><span className="kpi-n">{logins30.totalDocs}</span></div>
          <div className="kpi"><span className="small strong muted">Courses completed</span><span className="kpi-n">{completed.length}</span></div>
          <div className="kpi"><span className="small strong muted">Case studies submitted</span><span className="kpi-n">{cases.totalDocs}</span></div>
        </div>
        <div className="side-r" style={{ gap: '24px' }}>
          <section className="card pad stack g12" aria-labelledby="ts">
            <div className="row between g8"><h2 className="h4" id="ts" style={{ margin: 0 }}>Time spent per section</h2><span className="small muted">All time · time and visits</span></div>
            {sections.length ? (
              sections.map(([name, s]) => (
                <div key={name} className="hbar"><span className="strong">{name}</span><div className="hbar-t" aria-hidden="true"><span style={{ width: `${Math.round((s / topSeconds) * 100)}%` }}></span></div><span className="small"><strong>{fmtHM(s)}</strong>{' '}· {plural(sectionVisits.get(name) ?? 0, 'visit')}</span></div>
              ))
            ) : (
              <p className="muted">No visits recorded yet.</p>
            )}
          </section>
          <section className="card pad stack g12" aria-labelledby="ra">
            <h2 className="h4" id="ra" style={{ margin: 0 }}>Recent activity</h2>
            {recent.docs.length ? (
              <ol className="tl" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {recent.docs.map((a) => (
                  <li key={a.id} className="tl-i"><span className="stack"><span className="strong">{(WHAT[a.type] ?? (() => a.type))(a.detail)}</span><span className="small muted">{Date.now() - new Date(a.createdAt).getTime() < DAY ? fmtAgo(a.createdAt) : fmtDate(a.createdAt)}</span></span></li>
                ))}
              </ol>
            ) : (
              <p className="muted">No activity yet.</p>
            )}
          </section>
        </div>
        <section className="card pad stack g16" aria-labelledby="jr">
          <div className="row between g8" style={{ flexWrap: 'wrap' }}><h2 className="h4" id="jr" style={{ margin: 0 }}>Journey</h2><span className="small muted">Last {journeys.length || ''} {journeys.length === 1 ? 'visit' : 'visits'} · {plural(clickRows.docs.length, 'click')} in all</span></div>
          {journeys.length ? (
            journeys.map((j) => (
              <div key={j.start} className="stack g8" style={{ borderTop: '1px solid #E6DFCF', paddingTop: '14px' }}>
                <div className="row between g8" style={{ flexWrap: 'wrap' }}><span className="strong">{fmtDateTime(j.start)}</span><span className="small muted">From {j.source} · {plural(j.steps.length, 'page')} · {fmtHM(j.seconds)} · {plural(j.clicks, 'click')}</span></div>
                <ol className="stack g8" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {j.steps.map((s, i) => (
                    <li key={i} className="stack g4">
                      <span className="row g8" style={{ flexWrap: 'wrap' }}><span className="small muted" style={{ minWidth: '44px' }}>{fmtTime(s.at)}</span><span className="strong">{s.section}</span><span className="small muted" style={{ overflowWrap: 'anywhere' }}>{s.path}</span><span className="small">{fmtHM(s.seconds)}</span></span>
                      {s.clicks.length ? (
                        <span className="row g8" style={{ paddingLeft: '52px', flexWrap: 'wrap' }}>
                          {s.clicks.map((c, k) => (
                            <span key={k} className="bdg b-reg" style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }} title={c.target || undefined}>Clicked: {c.label}</span>
                          ))}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>
            ))
          ) : (
            <p className="muted">No visits recorded yet.</p>
          )}
        </section>
        <div className="side-r" style={{ gap: '24px' }}>
          <section className="card stack" aria-labelledby="lh" style={{ overflowX: 'auto' }}>
            <h2 className="h4" id="lh" style={{ margin: 0, padding: '20px 20px 12px' }}>Login history</h2>
            {loginRows.length ? (
              <table className="atbl m">
                <caption className="sr">Login history</caption>
                <thead><tr><th scope="col">Date and time</th><th scope="col">Method</th><th scope="col">Device</th><th scope="col">Location</th><th scope="col">Session</th></tr></thead>
                <tbody>
                  {loginRows.map((l) => (
                    <tr key={l.id}><td className="strong">{l.d}</td><td data-l="Method">{l.m}</td><td data-l="Device">{l.dev}</td><td data-l="Location">{l.loc}</td><td data-l="Session" className="small">{l.s}</td></tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="muted" style={{ padding: '0 20px 20px' }}>No logins recorded yet.</p>
            )}
          </section>
          <section className="card pad stack g12" aria-labelledby="cc">
            <h2 className="h4" id="cc" style={{ margin: 0 }}>Courses</h2>
            {enrollments.docs.length ? (
              enrollments.docs.map((e) => {
                const done = !!e.completedAt
                const p = Math.round(e.progress ?? 0)
                return (
                  <div key={e.id} className="res">
                    <span className={done ? 'mod-i done' : 'mod-i now'}>{done ? '✓' : p}</span>
                    <span className="stack grow"><span className="strong">{titleOf(e.course) ?? 'Course removed'}</span><span className="small muted">{done ? `Completed ${fmtDate(e.completedAt)}` : p ? `In progress · ${p}%` : e.savedForLater ? 'Saved for later' : 'Not started'}</span></span>
                  </div>
                )
              })
            ) : (
              <p className="muted">No courses started yet.</p>
            )}
          </section>
        </div>
        <div className="side-r" style={{ gap: '24px' }}>
          <section className="card pad stack g12" aria-labelledby="rc">
            <h2 className="h4" id="rc" style={{ margin: 0 }}>Registrations and case studies</h2>
            {regs.docs.length || cases.docs.length ? (
              <>
                {regs.docs.map((r) => (
                  <div key={`r${r.id}`} className="res"><span className="bdg b-info">Registration</span><span className="stack grow"><span className="strong">{titleOf(r.course) ?? 'Course registration'}</span><span className="small muted">{[r.session, `Submitted ${fmtDate(r.createdAt)}`].filter(Boolean).join(' · ')}</span></span></div>
                ))}
                {cases.docs.map((c) => {
                  const [label, cls] = CASE_STATUS[c.status] ?? ['Draft', 'bdg b-reg']
                  return (
                    <a key={`c${c.id}`} className="res" href="/admin/case-studies"><span className={cls}>{label}</span><span className="stack grow"><span className="strong">{c.title}</span><span className="small muted">Submitted {fmtDate(c.createdAt)}</span></span></a>
                  )
                })}
              </>
            ) : (
              <p className="muted">No course registrations or case studies yet.</p>
            )}
          </section>
          <section className="card pad stack g12" aria-labelledby="mn">
            <h2 className="h4" id="mn" style={{ margin: 0 }}>Membership and notes</h2>
            <MembershipForm id={m.id} tier={m.membershipTier ?? ''} status={m.membershipStatus ?? 'none'} note={m.adminNote ?? ''} />
          </section>
        </div>
      </main>
    </>
  )
}
