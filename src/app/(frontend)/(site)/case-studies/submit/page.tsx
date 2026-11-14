// Ported from SubmitCase.dc.html.
import Link from 'next/link'
import React from 'react'

import { SubmitCaseForm } from '@/components/cases/SubmitCaseForm'
import { getSiteCopy } from '@/lib/site/copy'

export const metadata = { title: 'Submit a Case Study / Poster' }

export default async function SubmitCasePage() {
  const copy = await getSiteCopy()
  return (
    <main>
      <section className="sec" style={{ paddingTop: '48px' }}>
        <div className="wrap stack g32">
          <div className="stack g12">
            <h1 className="sec-title">{copy.submitTitle}</h1>
          </div>
          <div className="side-r">
            <SubmitCaseForm />
            <aside className="card pad stack g20 sticky" aria-labelledby="how">
              <h2 className="h4" id="how">How Review Works</h2>
              <ol className="stack g16" style={{ listStyle: 'none', padding: '0' }}>
                <li className="row nowrap g12 top"><span className="num" style={{ width: '36px', height: '36px', fontSize: '15px' }}>1</span><div className="stack"><span className="strong">You submit</span><span className="small muted">You’ll get an email confirmation.</span></div></li>
                <li className="row nowrap g12 top"><span className="num" style={{ width: '36px', height: '36px', fontSize: '15px' }}>2</span><div className="stack"><span className="strong">HSN reviews{' '}<span className="bdg b-warn" style={{ height: '24px', marginInlineStart: '4px' }}>Pending</span></span><span className="small muted">We check the measures and may ask questions.</span></div></li>
                <li className="row nowrap g12 top"><span className="num" style={{ width: '36px', height: '36px', fontSize: '15px' }}>3</span><div className="stack"><span className="strong">Published or returned</span><span className="small muted">Approved studies appear in the repository. Returned ones come with a note on what to change.</span></div></li>
              </ol>
              <hr className="divider" />
              <span className="small muted">Track your submissions from your member dashboard once you’re logged in.</span>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}
