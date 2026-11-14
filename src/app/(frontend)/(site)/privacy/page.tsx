// Ported from Privacy.dc.html.
import React from 'react'

import { CONTACT_EMAIL } from '@/lib/site'
import { getSiteCopy } from '@/lib/site/copy'

export const metadata = { title: 'Privacy Policy' }

const toc = { minHeight: '40px', display: 'flex', alignItems: 'center', textDecoration: 'none' } as const

export default async function PrivacyPage() {
  const { privacy: p } = await getSiteCopy()
  return (
    <main>
      <section className="sec" style={{ paddingTop: '48px', paddingBottom: '40px' }}>
        <div className="wrap stack g24">
          <h1 className="sec-title">{p.title}</h1>
          <div className="row g12"><span className="bdg b-info">{p.date}</span><span className="small muted">{p.readTime}</span></div>
        </div>
      </section>
      <section className="sec" style={{ paddingTop: '0' }}>
        <div className="wrap side">
          <nav className="card pad stack g4 sticky" aria-label="Contents">
            <span className="over" style={{ paddingBottom: '8px' }}>{p.contents}</span>
            <a href="#p1" style={{ ...toc, fontWeight: 600, color: '#0B6B3A' }}>{p.s1}</a>
            <a href="#p2" style={toc}>{p.s2}</a>
            <a href="#p3" style={toc}>{p.s3}</a>
            <a href="#p4" style={toc}>{p.s4}</a>
            <a href="#p5" style={toc}>{p.s5}</a>
            <a href="#p6" style={toc}>{p.s6}</a>
            <a href="#p7" style={toc}>{p.s7}</a>
          </nav>
          <article className="stack g48" style={{ maxWidth: '760px' }}>
            <p className="lead">{p.lead}</p>
            <section id="p1" className="stack g16">
              <h2 className="h3">{p.s1}</h2>
              <p>{p.s1intro}</p>
              <dl className="stack g12">
                <div className="card pad stack g4" style={{ padding: '20px' }}><dt className="strong">{p.c1t}</dt><dd className="muted">{p.c1d}</dd></div>
                <div className="card pad stack g4" style={{ padding: '20px' }}><dt className="strong">{p.c2t}</dt><dd className="muted">{p.c2d}</dd></div>
                <div className="card pad stack g4" style={{ padding: '20px' }}><dt className="strong">{p.c3t}</dt><dd className="muted">{p.c3d}</dd></div>
              </dl>
            </section>
            <section id="p2" className="stack g16">
              <h2 className="h3">{p.s2}</h2>
              <p>{p.s2intro}</p>
              <ul className="stack g8">
                <li>{p.s2a}</li>
                <li>{p.s2b}</li>
                <li>{p.s2c}</li>
                <li>{p.s2d}</li>
              </ul>
            </section>
            <section id="p3" className="stack g16">
              <h2 className="h3">{p.s3}</h2>
              <div className="note note-ok"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B6E3F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none', marginTop: '2px' }}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z"></path><path d="m9 12 2 2 4-4"></path></svg><strong>{p.s3note}</strong></div>
              <p>{p.s3body}</p>
            </section>
            <section id="p4" className="stack g16">
              <h2 className="h3">{p.s4}</h2>
              <p>{p.s4body}</p>
            </section>
            <section id="p5" className="stack g16">
              <h2 className="h3">{p.s5}</h2>
              <dl className="stack g12">
                <div className="card pad stack g4" style={{ padding: '20px' }}><dt className="strong">{p.s5a}</dt><dd className="muted">{p.s5ad}</dd></div>
                <div className="card pad stack g4" style={{ padding: '20px' }}><dt className="strong">{p.s5b}</dt><dd className="muted">{p.s5bd}</dd></div>
              </dl>
            </section>
            <section id="p6" className="stack g16">
              <h2 className="h3">{p.s6}</h2>
              <p>{p.s6body}</p>
            </section>
            <section id="p7" className="stack g16">
              <h2 className="h3">{p.s7}</h2>
              <p>{p.s7body}</p>
              <a className="btn btn-s self-start" href={`mailto:${CONTACT_EMAIL}`} style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none' }}><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>{CONTACT_EMAIL}</a>
            </section>
          </article>
        </div>
      </section>
    </main>
  )
}
