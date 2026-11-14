// Ported from Services.dc.html.
import React from 'react'

import { getSiteCopy } from '@/lib/site/copy'

export const metadata = { title: 'Our Services' }

export default async function ServicesPage() {
  const { services } = await getSiteCopy()
  return (
    <main>
      <section className="sec" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
        <div className="wrap stack g24">
          <h1 className="sec-title">Our Services</h1>
        </div>
      </section>
      <section className="sec" style={{ paddingTop: '0' }}>
        <div className="wrap stack g20">
          {services.map((s, i) => (
            <article key={s.title} className="card pad-l stack g16">
              <div className="row nowrap g16" style={{ alignItems: 'center' }}>
                <span className="num" style={{ width: '52px', height: '52px', fontSize: '21px' }}>{i + 1}</span>
                <h2 className="h3" style={{ margin: '0' }}>{s.title}</h2>
              </div>
              <p className="lead" style={{ margin: '0' }}>{s.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
