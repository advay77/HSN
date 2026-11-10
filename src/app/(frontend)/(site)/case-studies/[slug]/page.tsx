// Ported from CaseStudy.dc.html. Every block is filled from the CMS and hidden when its fields are empty.
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { toSlug } from '@/collections/fields/slug'
import { getAdmin } from '@/lib/admin/auth'
import { caseStudyBySlug, mediaOf, publishedCaseStudies, readingMinutes } from '@/lib/content/caseStudies'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> }

// ?preview=1 shows an unpublished case study, but only to a signed-in admin.
const canPreview = async (sp: Props['searchParams']) => (await sp).preview === '1' && !!(await getAdmin())

export async function generateMetadata({ params, searchParams }: Props) {
  const preview = await canPreview(searchParams)
  const cs = await caseStudyBySlug((await params).slug, preview)
  return cs ? { title: cs.title, description: cs.summary, ...(preview ? { robots: { index: false } } : {}) } : {}
}

const tick = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B6B3A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg>
)
const linkStyle: React.CSSProperties = { minHeight: '40px', display: 'flex', alignItems: 'center', textDecoration: 'none' }
const paragraphs = (s?: string | null) => (s ? s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) : [])

export default async function CaseStudyPage({ params, searchParams }: Props) {
  const { slug } = await params
  const cs = await caseStudyBySlug(slug, await canPreview(searchParams))
  if (!cs) notFound()

  const related = (await publishedCaseStudies(20)).filter((d) => d.id !== cs.id).slice(0, 2)
  const impacts = cs.impacts ?? []
  const sections = (cs.sections ?? []).map((s) => ({ ...s, anchor: toSlug(s.heading) || `section-${s.id}` }))
  const lessons = cs.lessons ?? []
  const toc = [...sections.map((s) => ({ href: `#${s.anchor}`, label: s.heading })), ...(lessons.length ? [{ href: '#lessons', label: 'Lessons for Other Hospitals' }] : [])]
  const pdf = mediaOf(cs.pdf)
  const published = cs.publishedAt ? new Date(cs.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : null
  const author = [cs.submittedBy?.name, cs.submittedBy?.role].filter(Boolean).join(', ')
  const gridCls = (n: number) => `wrap grid c${Math.min(Math.max(n, 2), 4)}`

  // Case study images were removed at HSN's request (Nov 2026); an older uploaded image is no longer shown.
  const imageBlock = null

  return (
    <main>
      <section className="bg-teal" style={{ paddingBlock: '48px 56px' }}>
        <div className="wrap stack g24">
          <div className="row g8"><span className="bdg b-cat">{cs.category}</span>{cs.region && <span className="bdg b-reg">{cs.region}</span>}</div>
          <h1 className="h1" style={{ color: '#FFFFFF', maxWidth: '980px' }}>{cs.title}</h1>
          <div className="row g24 small" style={{ color: '#DCE6E2' }}>
            {cs.organization && <span>By{' '}<strong style={{ color: '#FFFFFF' }}>{cs.organization}</strong></span>}
            {published && <span>Published {published}</span>}
            <span>{readingMinutes(cs)} min read</span>
          </div>
        </div>
      </section>
      {impacts.length > 0 && (
        <section className="sec-sm" aria-label="Measured impact">
          <div className={gridCls(impacts.length)}>
            {impacts.map((m, i) =>
              i === 0 ? (
                <div key={m.id ?? i} className="card pad stack g4" style={{ background: '#E3F1E4', borderColor: '#B5D8B9' }}><span className="metric-l">{m.value}</span><span className="strong">{m.label}</span>{m.note && <span className="small muted">{m.note}</span>}</div>
              ) : (
                <div key={m.id ?? i} className="card pad stack g4"><span className="metric-l" style={{ color: '#134E5E' }}>{m.value}</span><span className="strong">{m.label}</span>{m.note && <span className="small muted">{m.note}</span>}</div>
              ),
            )}
          </div>
        </section>
      )}
      <section className="sec" style={{ paddingTop: '24px' }}>
        <div className="wrap side">
          <aside className="stack g20 sticky">
            {toc.length > 0 && (
              <nav className="card pad stack g4" aria-label="On this page">
                <span className="over" style={{ paddingBottom: '8px' }}>On this page</span>
                {toc.map((t, i) => (
                  <a key={t.href} href={t.href} className={i === 0 ? 'strong' : undefined} style={i === 0 ? { ...linkStyle, color: '#0B6B3A' } : linkStyle}>{t.label}</a>
                ))}
              </nav>
            )}
            {pdf?.url && (
              <a className="btn btn-s" href={pdf.url} download><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11"></path><path d="m7 10 5 5 5-5"></path><path d="M5 20h14"></path></svg>Download PDF</a>
            )}
          </aside>
          <article className="stack g48" style={{ maxWidth: '820px' }}>
            {sections.length === 0 && (
              <section className="stack g16">
                <p className="lead">{cs.summary}</p>
              </section>
            )}
            {sections.length === 0 && imageBlock}
            {sections.map((s, i) => (
              <React.Fragment key={s.id ?? i}>
                <section id={s.anchor} className="stack g16">
                  <h2 className="h2">{s.heading}</h2>
                  {s.lead && <p className="lead">{s.lead}</p>}
                  {paragraphs(s.body).map((p, j) => <p key={j}>{p}</p>)}
                  {(s.bullets ?? []).length > 0 && (
                    <ul className="ticks">
                      {s.bullets!.map((b, j) => <li key={b.id ?? j}>{tick}{b.text}</li>)}
                    </ul>
                  )}
                  {(s.tableRows ?? []).length > 0 && (
                    <div style={{ overflowX: 'auto' }} className="card">
                      <table className="tbl tbl-m">
                        <caption className="sr">{s.heading}</caption>
                        <thead><tr><th scope="col">Dimension</th><th scope="col">Measure</th><th scope="col">Result</th></tr></thead>
                        <tbody>
                          {s.tableRows!.map((r, j) => (
                            <tr key={r.id ?? j}><td className="strong">{r.dimension}</td><td>{r.measure}</td>{j === 0 ? <td className="strong" style={{ color: '#0B6B3A' }}>{r.result}</td> : <td>{r.result}</td>}</tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
                {i === 0 && imageBlock}
              </React.Fragment>
            ))}
            {lessons.length > 0 && (
              <section id="lessons" className="stack g16">
                <h2 className="h2">Lessons for Other Hospitals</h2>
                <div className="grid c2" style={{ gap: '16px' }}>
                  {lessons.map((l, i) => <div key={l.id ?? i} className="card pad stack g8"><span className="h5">{l.title}</span><span className="muted">{l.text}</span></div>)}
                </div>
              </section>
            )}
            {cs.organization && (
              <div className="card pad row g16" style={{ background: '#F5F1E6' }}>
                <span className="ic ic-t"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18"></path><path d="M5 21V7l7-4 7 4v14"></path><path d="M12 9v6M9 12h6"></path></svg></span>
                <div className="stack grow" style={{ minWidth: '220px' }}><span className="h5">{cs.organization}</span>{author && <span className="small muted">Submitted by {author}</span>}</div>
                <Link className="btn btn-s btn-sm" href="/case-studies/submit">Share your project</Link>
              </div>
            )}
          </article>
        </div>
      </section>
      {related.length > 0 && (
        <section className="sec bg-surface" aria-labelledby="related">
          <div className="wrap stack g32">
            <h2 className="h2" id="related">Related Case Studies</h2>
            <div className="grid c2">
              {related.map((r) => (
                <Link key={r.id} className="card card-link" href={`/case-studies/${r.slug}`} style={{ flexDirection: 'row' }}>
                  <div style={{ width: '10px', flex: 'none', background: r.color || '#134E5E' }}></div>
                  <div className="pad stack g8" style={{ flex: '1', minWidth: '0' }}><div className="row g8"><span className="bdg b-cat">{r.category}</span></div><span className="h5">{r.title}</span>{r.impacts?.[0] && <><span className="metric" style={{ fontSize: '24px', lineHeight: '30px' }}>{r.impacts[0].value}</span><span className="small muted strong">{r.impacts[0].label}</span></>}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
