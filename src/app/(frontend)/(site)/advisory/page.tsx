// Advisory Board: one profile card per advisor, managed in Admin → Advisory Board.
import type { Metadata } from 'next'
import React from 'react'

import '../../styles/pages/about.css'
import '../../styles/pages/advisory.css'

import { getPayloadClient } from '@/lib/payload'
import type { Media } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Advisory Board',
  description: 'The advisors guiding the Healthcare Sustainability Network.',
}
export const revalidate = 60

const photoOf = (photo: unknown, path?: string | null) => (photo && typeof photo === 'object' && (photo as Media).url ? (photo as Media).url! : path || null)
const initials = (name: string) => name.replace(/^(Dr|Prof|Mr|Ms|Mrs)\.?\s+/i, '').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()

export default async function AdvisoryPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'advisors', where: { published: { equals: true } }, sort: 'sort', pagination: false, depth: 1 })

  return (
    <main>
      <section className="sec" style={{ paddingTop: '48px', paddingBottom: '0' }}>
        <div className="wrap">
          <div className="green-box light-box">
            <h1 className="sec-title">Advisory Board</h1>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap stack g32">
          {docs.map((a) => {
            const paras = (a.bio || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
            const photo = photoOf(a.photo, a.photoPath)
            const anchor = `adv-${a.id}`
            return (
              <article key={a.id} className="card pad-l adv-person" aria-labelledby={anchor}>
                {photo ? <img className="adv-photo" src={photo} alt={a.name} /> : <span className="adv-photo adv-initials" aria-hidden="true">{initials(a.name)}</span>}
                <div className="stack g16 grow">
                  <div className="stack g8">
                    {a.badge && <span className="bdg b-cat self-start">{a.badge}</span>}
                    <h2 className="h2" id={anchor} style={{ margin: 0 }}>{a.name}</h2>
                    {a.role && <p className="lead" style={{ margin: 0 }}>{a.role}</p>}
                  </div>
                  {paras.length > 0 && (
                    <div className="adv-bio stack g16">
                      <p>{paras[0]}</p>
                      {paras.length > 1 && (
                        <details className="adv-more">
                          <summary><span className="adv-more-t">Read more</span><span className="adv-less-t">Read less</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></summary>
                          <div className="stack g16">{paras.slice(1).map((p, i) => <p key={i}>{p}</p>)}</div>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              </article>
            )
          })}
          {docs.length === 0 && <p className="muted">Advisory Board members will be announced soon.</p>}
        </div>
      </section>
    </main>
  )
}
