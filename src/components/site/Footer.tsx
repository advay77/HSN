// Ported from Footer.dc.html. Markup, classes and inline styles match the design.
import Link from 'next/link'
import React from 'react'

import { SOCIAL } from '@/lib/site'
import { FooterA11yLink } from './FooterA11yLink'

export function Footer() {
  return (
    <div className="cq" style={{ fontFamily: 'Inter, system-ui, sans-serif', width: '100%' }}>
      <footer className="ftr">
        <div className="wrap">
          <div className="ftr-g">
            <div className="stack g16 ftr-brand">
              <Link className="logo" href="/" aria-label="Healthcare Sustainability Network, home">
                <span className="logo-m"><img src="/images/hsn-logo.jpg" alt="" /></span>
                <span className="logo-t"><span className="logo-1" style={{ color: '#FFFFFF' }}>HEALTHCARE</span><span className="logo-2" style={{ color: '#BFE6F3' }}>SUSTAINABILITY NETWORK</span></span>
              </Link>
              <p style={{ margin: 0, color: '#DCE6E2', maxWidth: '360px' }}>Collaborating for a Green and Healthy Future.</p>
              <div className="row g8" aria-label="HSN on social media">
                <a className="soc" href={SOCIAL.linkedin} target="_blank" rel="noopener" aria-label="HSN on LinkedIn"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4V21H3zM9.5 9.75h3.8v1.6h.06c.53-1 1.84-2.05 3.78-2.05 4.05 0 4.8 2.66 4.8 6.12V21h-4v-5.03c0-1.2-.02-2.74-1.67-2.74-1.67 0-1.93 1.3-1.93 2.65V21h-4z" /></svg></a>
                {SOCIAL.instagram && (<a className="soc" href={SOCIAL.instagram} target="_blank" rel="noopener" aria-label="HSN on Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg></a>)}
                {SOCIAL.facebook && (<a className="soc" href={SOCIAL.facebook} target="_blank" rel="noopener" aria-label="HSN on Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46h1.55V4.47A20.6 20.6 0 0 0 14.3 4.3c-2.24 0-3.8 1.37-3.8 3.9v2.3H8v3h2.5V21z" /></svg></a>)}
                <a className="soc" href={SOCIAL.whatsapp} target="_blank" rel="noopener" aria-label="HSN WhatsApp group"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3.2 3.1z" /><path d="M9 9.5c.3 2.3 2.2 4.2 4.5 4.5l1-1.2 2 1-.4 1.5c-3.6.3-7.2-3.3-6.9-6.9l1.5-.4 1 2z" /></svg></a>
              </div>
            </div>
            <nav aria-label="Explore" className="stack">
              <span className="ftr-h">Explore</span>
              <Link className="ftr-l" href="/">Home</Link>
              <Link className="ftr-l" href="/about">About Us</Link>
              <Link className="ftr-l" href="/advisory">Advisory Board</Link>
              <Link className="ftr-l" href="/services">Services</Link>
              <Link className="ftr-l" href="/courses">Courses</Link>
            </nav>
            <nav aria-label="Network" className="stack">
              <span className="ftr-h">Network</span>
              <Link className="ftr-l" href="/case-studies">Case Studies</Link>
              <Link className="ftr-l" href="/library">Library</Link>
              <Link className="ftr-l" href="/get-involved">Get Involved</Link>
              <Link className="ftr-l" href="/membership">Membership</Link>
              <Link className="ftr-l" href="/login">Log in</Link>
            </nav>
            <div className="stack">
              <span className="ftr-h">Support</span>
              <FooterA11yLink />
              <Link className="ftr-l" href="/feedback">Feedback</Link>
              <Link className="ftr-l" href="/privacy">Privacy Policy</Link>
              <div className="ftr-contact" style={{ background: 'none', border: 0, padding: 0 }}>
                <Link className="btn btn-sm btn-light" href="/contact"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>Contact us</Link>
              </div>
            </div>
          </div>
          <div className="ftr-b">
            <span>© {new Date().getFullYear()} Healthcare Sustainability Network</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
