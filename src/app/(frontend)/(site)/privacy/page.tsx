// Ported from Privacy.dc.html.
import Link from 'next/link'
import React from 'react'

import { CONTACT_EMAIL } from '@/lib/site'

export const metadata = { title: 'Privacy Policy' }

const toc = { minHeight: '40px', display: 'flex', alignItems: 'center', textDecoration: 'none' } as const

export default function PrivacyPage() {
  return (
    <main>
      <section className="sec" style={{ paddingTop: '48px', paddingBottom: '40px' }}>
        <div className="wrap stack g24">
          <h1 className="sec-title hero-title">Privacy Policy</h1>
          <div className="row g12"><span className="bdg b-info">Effective Date: October 26, 2026</span><span className="small muted">About a 4-minute read</span></div>
        </div>
      </section>
      <section className="sec" style={{ paddingTop: '0' }}>
        <div className="wrap side">
          <nav className="card pad stack g4 sticky" aria-label="Contents">
            <span className="over" style={{ paddingBottom: '8px' }}>Contents</span>
            <a href="#p1" style={{ ...toc, fontWeight: 600, color: '#0B6B3A' }}>1. Information We Collect</a>
            <a href="#p2" style={toc}>2. How We Use Your Information</a>
            <a href="#p3" style={toc}>3. How We Share Your Information</a>
            <a href="#p4" style={toc}>4. Data Security</a>
            <a href="#p5" style={toc}>5. Your Choices and Rights</a>
            <a href="#p6" style={toc}>6. Changes to This Privacy Policy</a>
            <a href="#p7" style={toc}>7. Contact Us</a>
          </nav>
          <article className="stack g48" style={{ maxWidth: '760px' }}>
            <p className="lead">At the Healthcare Sustainability Network (HSN), we respect your privacy and are committed to protecting any personal information you share with us. This Privacy Policy outlines what information we collect, how we use it, and how we keep it safe.</p>
            <section id="p1" className="stack g16">
              <h2 className="h3">1. Information We Collect</h2>
              <p>We may collect personal information when you interact with us, sign up for our network, or subscribe to our updates. This may include:</p>
              <dl className="stack g12">
                <div className="card pad stack g4" style={{ padding: '20px' }}><dt className="strong">Contact Information</dt><dd className="muted">Your name, email address, and phone number.</dd></div>
                <div className="card pad stack g4" style={{ padding: '20px' }}><dt className="strong">Professional Details</dt><dd className="muted">Your organization, hospital, clinic, or professional role.</dd></div>
                <div className="card pad stack g4" style={{ padding: '20px' }}><dt className="strong">Communications</dt><dd className="muted">Messages, inquiries, or feedback you send to us.</dd></div>
              </dl>
            </section>
            <section id="p2" className="stack g16">
              <h2 className="h3">2. How We Use Your Information</h2>
              <p>We use the collected information for the following purposes:</p>
              <ul className="stack g8">
                <li>To respond to your inquiries and communicate about HSN initiatives.</li>
                <li>To manage network memberships, community updates, and event invitations.</li>
                <li>To share newsletters, resources, and toolkits related to sustainable healthcare practices.</li>
                <li>To improve our network offerings and collaboration opportunities.</li>
              </ul>
            </section>
            <section id="p3" className="stack g16">
              <h2 className="h3">3. How We Share Your Information</h2>
              <div className="note note-ok"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B6E3F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none', marginTop: '2px' }}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z"></path><path d="m9 12 2 2 4-4"></path></svg><strong>We do not sell, rent, or trade your personal information to third parties.</strong></div>
              <p>We may share information only with your explicit consent (e.g., connecting members within the network) or if required by law.</p>
            </section>
            <section id="p4" className="stack g16">
              <h2 className="h3">4. Data Security</h2>
              <p>We take reasonable administrative, technical, and physical measures to protect your personal information from unauthorized access, loss, misuse, or disclosure. However, no data transmission over the internet can be guaranteed 100% secure.</p>
            </section>
            <section id="p5" className="stack g16">
              <h2 className="h3">5. Your Choices and Rights</h2>
              <dl className="stack g12">
                <div className="card pad stack g4" style={{ padding: '20px' }}><dt className="strong">Opt-Out</dt><dd className="muted">You can unsubscribe from our mailing lists or community updates at any time by replying &quot;Unsubscribe&quot; to any of our emails.</dd></div>
                <div className="card pad stack g4" style={{ padding: '20px' }}><dt className="strong">Access or Update</dt><dd className="muted">You can request to view, update, or delete the personal information we hold about you by contacting us.</dd></div>
              </dl>
            </section>
            <section id="p6" className="stack g16">
              <h2 className="h3">6. Changes to This Privacy Policy</h2>
              <p>We may update this Privacy Policy from time to time. Any changes will be posted here with an updated effective date.</p>
            </section>
            <section id="p7" className="stack g16">
              <h2 className="h3">7. Contact Us</h2>
              <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:</p>
              <a className="btn btn-s self-start" href={`mailto:${CONTACT_EMAIL}`} style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none' }}><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>{CONTACT_EMAIL}</a>
            </section>
          </article>
        </div>
      </section>
    </main>
  )
}
