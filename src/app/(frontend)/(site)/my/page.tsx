// Ported from Dashboard.dc.html. Shows only the signed-in member's own records.
import Link from 'next/link'
import React from 'react'

import { formatDate, MemberNav, TIER_LABEL } from '@/components/member/MemberNav'
import { requireMember } from '@/lib/auth/guard'
import { getPayloadClient } from '@/lib/payload'
import { SOCIAL } from '@/lib/site'
import type { Course } from '@/payload-types'

export const metadata = { title: 'My HSN' }

// "Dr. Aisha Rahman" → "Dr. Aisha"; "Aisha Rahman" → "Aisha".
const greetingName = (name: string) => {
  const parts = name.trim().split(/\s+/)
  return /^(dr|prof|mr|mrs|ms)\.?$/i.test(parts[0] || '') && parts[1] ? `${parts[0]} ${parts[1]}` : parts[0] || name
}

const arrow = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>

export default async function DashboardPage() {
  const member = await requireMember('/my')
  const payload = await getPayloadClient()

  const [enrollments, registrations, cases] = await Promise.all([
    payload.find({ collection: 'enrollments', where: { member: { equals: member.id } }, sort: '-updatedAt', depth: 1, limit: 100 }),
    payload.find({
      collection: 'course-registrations',
      where: { or: [{ member: { equals: member.id } }, { email: { equals: member.email } }] },
      sort: '-createdAt',
      depth: 1,
      limit: 100,
    }),
    payload.find({ collection: 'case-studies', where: { 'submittedBy.email': { equals: member.email } }, sort: '-createdAt', depth: 0, limit: 100 }),
  ])

  const courses = enrollments.docs
    .filter((e) => typeof e.course === 'object' && e.course)
    .map((e) => {
      const course = e.course as Course
      const progress = Math.max(0, Math.min(100, Math.round(e.progress ?? 0)))
      return { id: e.id, course, progress, completed: !!e.completedAt || progress >= 100 }
    })
  const inProgress = courses.filter((c) => !c.completed && c.progress > 0)
  const completed = courses.filter((c) => c.completed)
  const notStarted = courses.filter((c) => !c.completed && c.progress === 0)
  const continueCourse = inProgress[0] ?? notStarted[0]
  const tier = member.membershipStatus === 'active' && member.membershipTier ? TIER_LABEL[member.membershipTier] : null

  return (
    <main className="sec" style={{ paddingTop: '40px' }}>
      <div className="wrap mlay">
        <MemberNav current="dashboard" />
        <div className="stack g40">
          <div className="row between end g16">
            <div className="stack g8">
              <span className="over">Member area</span>
              <h1 className="h1">Welcome back, {greetingName(member.name)}</h1>
              {tier && <div className="row g8"><span className="bdg b-cat">{tier}</span></div>}
            </div>
            {continueCourse ? (
              <Link className="btn btn-p" href={`/courses/${continueCourse.course.slug}/learn`}>Continue learning{arrow}</Link>
            ) : (
              <Link className="btn btn-p" href="/courses">Browse courses{arrow}</Link>
            )}
          </div>
          <div className="grid c4" style={{ gap: '16px' }}>
            <div className="stat"><span className="stat-n">{inProgress.length}</span><span className="strong">Courses in progress</span></div>
            <div className="stat"><span className="stat-n">{completed.length}</span><span className="strong">Courses completed</span></div>
            <div className="stat"><span className="stat-n">{registrations.totalDocs}</span><span className="strong">Course registrations</span></div>
            <div className="stat"><span className="stat-n">{cases.totalDocs}</span><span className="strong">Case studies submitted</span></div>
          </div>

          <section id="my-courses" className="stack g16" aria-labelledby="mc">
            <div className="row between g8"><h2 className="h3" id="mc">My Courses</h2><Link className="btn btn-t btn-sm" href="/courses">Browse the library</Link></div>
            <div className="card">
              {courses.length === 0 && (
                <div className="lrow" style={{ flexWrap: 'wrap' }}>
                  <span className="muted grow" style={{ minWidth: '240px' }}>You haven’t started a course yet.</span>
                  <Link className="btn btn-s btn-sm" href="/courses">Browse courses</Link>
                </div>
              )}
              {[...inProgress, ...notStarted].map((c, i) => (
                <div className="lrow" style={{ flexWrap: 'wrap' }} key={c.id}>
                  {i === 0 ? (
                    <span className="ic ic-g" style={{ width: '48px', height: '48px' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15"></path><path d="M5 19 13 11"></path></svg></span>
                  ) : (
                    <span className="ic ic-a" style={{ width: '48px', height: '48px' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M3 12h4l2-5 4 10 2-5h6"></path></svg></span>
                  )}
                  <div className="stack g8 grow" style={{ minWidth: '240px' }}><span className="h5">{c.course.title}</span><div className="row g12"><div className="prog grow" style={{ maxWidth: '320px' }} role="progressbar" aria-valuenow={c.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Progress"><span style={{ width: `${c.progress}%` }}></span></div><span className="small strong">{c.progress}%</span></div></div>
                  <Link className={i === 0 ? 'btn btn-p btn-sm' : 'btn btn-s btn-sm'} href={`/courses/${c.course.slug}/learn`}>{c.progress > 0 ? 'Continue' : 'Start'}</Link>
                </div>
              ))}
              {completed.map((c) => (
                <div className="lrow" style={{ flexWrap: 'wrap' }} key={c.id}>
                  <span className="ic" style={{ width: '48px', height: '48px', background: '#0B6B3A', color: '#FFFFFF' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg></span>
                  <div className="stack g4 grow" style={{ minWidth: '240px' }}><span className="h5">{c.course.title}</span><span className="small muted">{c.course.certificate?.enabled ? 'Completed · certificate ready' : 'Completed'}</span></div>
                  <span className="row g8">
                    {c.course.certificate?.enabled ? (
                      <Link className="btn btn-s btn-sm" href={`/courses/${c.course.slug}/certificate`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11"></path><path d="m7 10 5 5 5-5"></path><path d="M5 20h14"></path></svg>Certificate</Link>
                    ) : (
                      <Link className="btn btn-s btn-sm" href={`/courses/${c.course.slug}/learn`}>Review course</Link>
                    )}
                    <Link className="btn btn-s btn-sm" href={`/courses/${c.course.slug}/feedback`}>Feedback</Link>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section id="registrations" className="stack g16" aria-labelledby="rg">
            <h2 className="h3" id="rg">My Course Registrations</h2>
            <div className="card" style={{ overflowX: 'auto', position: 'relative' }}>
              {registrations.docs.length === 0 ? (
                <div className="lrow"><span className="muted">You haven’t registered for a course session yet.</span></div>
              ) : (
                <table className="tbl tbl-m">
                  <caption className="sr">My course registrations</caption>
                  <thead><tr><th scope="col">Course</th><th scope="col">Session</th><th scope="col">Registered</th><th scope="col">Status</th></tr></thead>
                  <tbody>
                    {registrations.docs.map((r) => (
                      <tr key={r.id}>
                        <td className="strong">{typeof r.course === 'object' && r.course ? r.course.title : 'Course'}</td>
                        <td>To be confirmed</td>
                        <td>{formatDate(r.createdAt)}</td>
                        <td><span className="bdg b-warn">Awaiting confirmation</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section id="cases" className="stack g16" aria-labelledby="cs">
            <div className="row between g8"><h2 className="h3" id="cs">My Submitted Case Studies</h2><Link className="btn btn-s btn-sm" href="/case-studies/submit">Submit a case study</Link></div>
            <div className="card">
              {cases.docs.length === 0 && (
                <div className="lrow"><span className="muted">You haven’t submitted a case study yet.</span></div>
              )}
              {cases.docs.map((c) => {
                const meta = [c.category, `submitted ${formatDate(c.createdAt)}`].filter(Boolean).join(' · ')
                return (
                  <div className="lrow" style={{ flexWrap: 'wrap' }} key={c.id}>
                    <div className="stack g4 grow" style={{ minWidth: '240px' }}><span className="h5">{c.title}</span><span className="small muted">{meta}</span>{c.status === 'returned' && c.reviewNote && <div className="note note-err" style={{ padding: '12px 14px' }}><span className="small"><strong>Note from HSN:</strong>{' '}{c.reviewNote}</span></div>}</div>
                    {c.status === 'published' ? (
                      <>
                        <span className="bdg b-ok"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg>Approved</span>
                        <Link className="btn btn-t btn-sm" href={`/case-studies/${c.slug}`}>View published</Link>
                      </>
                    ) : c.status === 'rejected' ? (
                      <span className="bdg b-reg">Not published</span>
                    ) : c.status === 'returned' ? (
                      <>
                        <span className="bdg b-err"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M9 14 4 9l5-5"></path><path d="M4 9h11a5 5 0 0 1 0 10h-3"></path></svg>Returned</span>
                        <Link className="btn btn-p btn-sm" href="/case-studies/submit">Edit and resubmit</Link>
                      </>
                    ) : (
                      <>
                        <span className="bdg b-warn"><span style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#E0A526' }}></span>Pending</span>
                        <span className="small muted">In review</span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          <section className="stack g16" aria-labelledby="cm">
            <h2 className="h3" id="cm">Community</h2>
            <div className="grid c2" style={{ gap: '16px' }}>
              <a className="card pad row g16 card-link" href={SOCIAL.whatsapp} target="_blank" rel="noopener" style={{ flexDirection: 'row', alignItems: 'center' }}><span className="ic ic-g"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z"></path></svg></span><span className="stack grow"><span className="h5">HSN WhatsApp community</span><span className="small muted">Peer questions, events and quick wins</span></span><span className="strong" style={{ color: '#1C6E8A' }}>Open</span></a>
              <a className="card pad row g16 card-link" href={SOCIAL.linkedin} target="_blank" rel="noopener" style={{ flexDirection: 'row', alignItems: 'center' }}><span className="ic ic-a"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"></rect><path d="M8 10v7"></path><path d="M8 7h.01"></path><path d="M12 17v-4a2 2 0 0 1 4 0v4"></path><path d="M12 10v7"></path></svg></span><span className="stack grow"><span className="h5">HSN on LinkedIn</span><span className="small muted">Case studies, webinars and news</span></span><span className="strong" style={{ color: '#1C6E8A' }}>Open</span></a>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
