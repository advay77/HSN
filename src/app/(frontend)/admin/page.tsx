// Ported from AdminOverview.dc.html. Every number comes from the database (members, activity, page views).
import React from 'react'

import '@/app/(frontend)/styles/pages/admin-overview.css'

import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { requireAdmin } from '@/lib/admin/auth'
import { formatDuration, getOverview } from '@/lib/admin/overview'
import { plural } from '@/lib/admin/visits'

export const metadata = { title: 'Overview' }

const pct = (n: number, of: number) => (of ? `${Math.round((n / of) * 100)}% of members` : 'No members yet')
const signed = (n: number) => (n > 0 ? `+${n}` : String(n))
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default async function AdminOverviewPage() {
  const admin = await requireAdmin('/admin')
  const o = await getOverview()
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const max = Math.max(1, ...o.perDay.map((d) => d.v))
  const totalLogins = o.perDay.reduce((s, d) => s + d.v, 0)
  const peak = o.perDay.reduce((a, b) => (b.v > a.v ? b : a), o.perDay[0]!)
  const fmt = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`
  const bars = o.perDay.map((d, i) => ({
    v: String(d.v),
    d: String(d.date.getDate()) + (i === 0 || d.date.getDate() === 1 ? ' ' + MONTHS[d.date.getMonth()] : ''),
    cls: i === o.perDay.length - 1 ? 'vbar-b wk' : 'vbar-b',
    height: Math.round((d.v / max) * 170),
  }))
  const topSeconds = Math.max(1, ...o.sections.map((s) => s.seconds))
  const attention = [
    { n: o.pendingCases, cls: 'bdg b-warn', label: o.pendingCases === 1 ? 'Case study waiting for approval' : 'Case studies waiting for approval', href: '/admin/case-studies' },
    { n: o.regsWeek, cls: 'bdg b-info', label: 'New course registrations this week', href: '/admin/registrations' },
    { n: o.interestWeek, cls: 'bdg b-info', label: 'New membership interest entries', href: '/admin/interest' },
  ]

  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        left={<div className="stack g4"><h1 className="h2" style={{ margin: 0 }}>Overview</h1><span className="small muted">{today}</span></div>}
        actions={
          <form action="/admin/members" role="search">
            <label className="sr" htmlFor="as">Search members</label>
            <input className="inp" id="as" name="q" type="search" placeholder="Search members" style={{ width: '260px', minHeight: '44px' }} />
          </form>
        }
      />
      <main className="amain">
        <div className="grid c5" style={{ gap: '16px' }}>
          <div className="kpi"><span className="small strong muted">Total members</span><span className="kpi-n">{o.total}</span><span className="kpi-d">{signed(o.newWeek)} this week</span></div>
          <div className="kpi"><span className="small strong muted">New this week</span><span className="kpi-n">{o.newWeek}</span><span className="kpi-d">{signed(o.newWeek - o.newPrevWeek)} vs last week</span></div>
          <div className="kpi"><span className="small strong muted row g8"><span className={o.online ? 'dot' : 'dot off'}></span>Online now</span><span className="kpi-n">{o.online}</span><span className="small muted">Seen in the last 5 minutes</span></div>
          <div className="kpi"><span className="small strong muted">Active today</span><span className="kpi-n">{o.activeToday}</span><span className="small muted">{pct(o.activeToday, o.total)}</span></div>
          <div className="kpi"><span className="small strong muted">Active, last 7 days</span><span className="kpi-n">{o.active7}</span><span className="small muted">{pct(o.active7, o.total)}</span></div>
        </div>
        <section className="stack g12" aria-labelledby="wv">
          <div className="row between g8"><h2 className="h4" id="wv" style={{ margin: 0 }}>Website visits</h2><span className="small muted">Last 30 days · members and guests</span></div>
          <div className="grid c4" style={{ gap: '16px' }}>
            <div className="kpi"><span className="small strong muted">Visits</span><span className="kpi-n">{o.traffic.visits}</span><span className="small muted">Separate browsing sessions</span></div>
            <div className="kpi"><span className="small strong muted">Unique visitors</span><span className="kpi-n">{o.traffic.visitors}</span><span className="small muted">People or browsers</span></div>
            <div className="kpi"><span className="small strong muted">Pages viewed</span><span className="kpi-n">{o.traffic.pageViews}</span><span className="small muted">{o.traffic.visits ? `${Math.round((o.traffic.pageViews / o.traffic.visits) * 10) / 10} per visit` : 'No visits yet'}</span></div>
            <div className="kpi"><span className="small strong muted">Average visit</span><span className="kpi-n">{formatDuration(o.traffic.avgVisit)}</span><span className="small muted">Time on pages per visit</span></div>
          </div>
        </section>
        <div className="side-r" style={{ gap: '24px' }}>
          <section className="card pad stack g12" aria-labelledby="lg">
            <div className="row between g8"><h2 className="h4" id="lg" style={{ margin: 0 }}>Logins per day · last 14 days</h2><span className="small muted">Total {totalLogins} · today highlighted</span></div>
            <div className="vbars" role="img" aria-label={`Logins per day for the last 14 days, from ${fmt(o.perDay[0]!.date)} to ${fmt(o.perDay[13]!.date)}.${totalLogins ? ` Peak of ${peak.v} on ${fmt(peak.date)}.` : ' No logins yet.'}`}>
              {bars.map((b, i) => (
                <div key={i} className="vbar-c"><span className="vbar-v">{b.v}</span><div className={b.cls} style={{ height: `${b.height}px` }}></div></div>
              ))}
            </div>
            <div className="vlabels" aria-hidden="true">{bars.map((b, i) => <span key={i}>{b.d}</span>)}</div>
          </section>
          <section className="card pad stack g8" aria-labelledby="fd">
            <div className="row between g8"><h2 className="h4" id="fd" style={{ margin: 0 }}>Live activity</h2><span className="bdg b-ok"><span className="dot"></span>Live</span></div>
            {o.feed.length ? (
              <ul className="feed" style={{ listStyle: 'none', padding: 0, margin: 0 }} aria-live="polite">
                {o.feed.map((f) => (
                  <li key={f.id} className="feed-i"><span className="avatar" style={{ width: '32px', height: '32px', fontSize: '12px', background: f.bg }}>{f.i}</span><span className="stack grow"><span><strong>{f.who}</strong>{' '}{f.what}</span><span className="small muted">{f.when}</span></span></li>
                ))}
              </ul>
            ) : (
              <p className="muted" style={{ padding: '12px 0' }}>No member activity yet. Sign-ins, course progress and form submissions will show here.</p>
            )}
          </section>
        </div>
        <div className="side-r" style={{ gap: '24px' }}>
          <section className="card pad stack g12" aria-labelledby="mv">
            <div className="row between g8"><h2 className="h4" id="mv" style={{ margin: 0 }}>Most viewed sections</h2><span className="small muted">Last 30 days · total time and visits</span></div>
            {o.sections.length ? (
              o.sections.map((s) => (
                <div key={s.name} className="hbar"><span className="strong">{s.name}</span><div className="hbar-t" aria-hidden="true"><span style={{ width: `${Math.round((s.seconds / topSeconds) * 100)}%` }}></span></div><span className="small"><strong>{formatDuration(s.seconds)}</strong>{' '}· {plural(s.visits, 'visit')}</span></div>
              ))
            ) : (
              <p className="muted">No visits recorded yet.</p>
            )}
          </section>
          <div className="stack g24">
            <section className="card pad stack g12" aria-labelledby="na">
              <h2 className="h4" id="na" style={{ margin: 0 }}>Needs your attention</h2>
              {attention.map((a) => (
                <a key={a.href} className="res" href={a.href}><span className={a.cls}>{a.n}</span><span className="grow strong">{a.label}</span></a>
              ))}
            </section>
            <section className="card pad stack g12" aria-labelledby="fv">
              <div className="row between g8"><h2 className="h4" id="fv" style={{ margin: 0 }}>Most frequent members</h2><span className="small muted">Last 30 days</span></div>
              {o.traffic.topMembers.length ? (
                o.traffic.topMembers.map((t) => (
                  <a key={t.id} className="res" href={`/admin/members/${t.id}`}><span className="bdg b-info">{t.visits}</span><span className="grow stack"><span className="strong">{t.name}</span><span className="small muted">{plural(t.visits, 'visit')} · {formatDuration(t.seconds)} on site</span></span></a>
                ))
              ) : (
                <p className="muted">No member visits yet.</p>
              )}
            </section>
          </div>
        </div>
        <div className="side-r" style={{ gap: '24px' }}>
          <section className="card pad stack g12" aria-labelledby="mc">
            <div className="row between g8"><h2 className="h4" id="mc" style={{ margin: 0 }}>Most clicked</h2><span className="small muted">Last 30 days · {plural(o.traffic.clicks, 'click')} in all</span></div>
            {o.traffic.topClicks.length ? (
              o.traffic.topClicks.map((c) => (
                <div key={c.label + c.section} className="res" style={{ cursor: 'default' }}><span className="bdg b-info">{c.count}</span><span className="grow stack"><span className="strong">{c.label}</span><span className="small muted">on {c.section}</span></span></div>
              ))
            ) : (
              <p className="muted">No clicks recorded yet.</p>
            )}
          </section>
          <div className="stack g24">
            <section className="card pad stack g12" aria-labelledby="ws">
              <div className="row between g8"><h2 className="h4" id="ws" style={{ margin: 0 }}>Where visitors come from</h2><span className="small muted">Last 30 days</span></div>
              {o.traffic.sources.length ? (
                o.traffic.sources.map(([name, n]) => (
                  <div key={name} className="row between g8"><span className="strong">{name}</span><span className="small">{plural(n, 'visit')}</span></div>
                ))
              ) : (
                <p className="muted">No visits recorded yet.</p>
              )}
            </section>
            <section className="card pad stack g12" aria-labelledby="cp">
              <div className="row between g8"><h2 className="h4" id="cp" style={{ margin: 0 }}>Common paths</h2><span className="small muted">Last 30 days</span></div>
              {o.traffic.paths.length ? (
                o.traffic.paths.map(([name, n]) => (
                  <div key={name} className="row between g8"><span className="strong">{name}</span><span className="small">{n}×</span></div>
                ))
              ) : (
                <p className="muted">No page-to-page moves yet.</p>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
