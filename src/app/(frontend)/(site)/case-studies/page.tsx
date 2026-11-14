// Ported from CaseStudies.dc.html. The list comes from published case studies in the CMS.
import Link from 'next/link'
import React from 'react'

import { CaseStudyList, type CaseStudyRow } from '@/components/cases/CaseStudyList'
import { publishedCaseStudies } from '@/lib/content/caseStudies'

import '../../styles/pages/case-studies.css'

export const metadata = { title: 'Case Studies/Posters' }
export const dynamic = 'force-dynamic'

export default async function CaseStudiesPage() {
  const docs = await publishedCaseStudies()
  const rows: CaseStudyRow[] = docs.map((d) => ({
    slug: d.slug || String(d.id),
    title: d.title,
    cat: d.category ?? '',
    organization: d.organization || '',
    metric: d.impacts?.[0]?.value || '',
    unit: d.impacts?.[0]?.label || '',
    color: d.color || '#134E5E',
    summary: d.summary,
  }))

  return (
    <main>
      <section className="sec" style={{ paddingTop: '48px', paddingBottom: '40px' }}>
        <div className="wrap stack g24">
          <div className="stack g20">
            <h1 className="sec-title hero-title">Case Studies/Posters</h1>
            <p className="lead">Real-world projects from hospitals cutting carbon, waste and cost without compromising patient safety.</p>
            <Link className="btn btn-s self-start" href="/case-studies/submit"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>Submit a case study</Link>
          </div>
        </div>
      </section>
      <section className="sec" style={{ paddingTop: '0' }} aria-labelledby="all-cs">
        <CaseStudyList rows={rows} />
      </section>
      <section className="sec bg-teal">
        <div className="wrap">
          <div className="stack g16" style={{ maxWidth: '900px' }}>
            <h2 className="sec-title">Have a project that cut carbon, waste or cost?</h2>
            <p className="lead muted">Submit case studies, research papers, and technical guides to be featured across HSN channels.</p>
            <Link className="btn btn-lg btn-light self-start" href="/case-studies/submit">Submit a case study</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
