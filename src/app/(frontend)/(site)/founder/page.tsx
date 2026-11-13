// Founder page. HSN will share the founder's details; until then it shows the heading and a short note.
import React from 'react'

import '../../styles/pages/about.css'

export const metadata = { title: 'Founder' }

export default function FounderPage() {
  return (
    <main>
      <section className="sec" style={{ paddingTop: '48px' }}>
        <div className="wrap">
          <div className="green-box light-box">
            <h1 className="sec-title">Founder</h1>
            <p className="box-text">The founder&apos;s profile will be added here soon.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
