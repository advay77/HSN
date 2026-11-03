// Arabic footer, ported from the footer block in HomeAr.dc.html.
import Link from 'next/link'
import React from 'react'

import { ArA11yLink } from './ArA11yLink'
import { SOCIAL } from '@/lib/site'

export function ArFooter() {
  return (
    <div className="cq">
      <footer className="ftr">
        <div className="wrap">
          <div className="ftr-g">
            <div className="stack g16 ftr-brand"><span className="ar-k" style={{ fontWeight: 800, fontSize: '20px', color: '#FFFFFF' }}>شبكة استدامة الرعاية الصحية</span><p style={{ margin: 0, color: '#DCE6E2' }}>التعاون من أجل مستقبل أخضر وصحي.</p>
              <div className="row g8" aria-label="HSN على وسائل التواصل">
                <a className="soc" href={SOCIAL.linkedin} target="_blank" rel="noopener" aria-label="HSN on LinkedIn"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4V21H3zM9.5 9.75h3.8v1.6h.06c.53-1 1.84-2.05 3.78-2.05 4.05 0 4.8 2.66 4.8 6.12V21h-4v-5.03c0-1.2-.02-2.74-1.67-2.74-1.67 0-1.93 1.3-1.93 2.65V21h-4z" /></svg></a>
                <a className="soc" href={SOCIAL.instagram} target="_blank" rel="noopener" aria-label="HSN on Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg></a>
                <a className="soc" href={SOCIAL.facebook} target="_blank" rel="noopener" aria-label="HSN on Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46h1.55V4.47A20.6 20.6 0 0 0 14.3 4.3c-2.24 0-3.8 1.37-3.8 3.9v2.3H8v3h2.5V21z" /></svg></a>
                <a className="soc" href={SOCIAL.whatsapp} target="_blank" rel="noopener" aria-label="HSN WhatsApp group"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3.2 3.1z" /><path d="M9 9.5c.3 2.3 2.2 4.2 4.5 4.5l1-1.2 2 1-.4 1.5c-3.6.3-7.2-3.3-6.9-6.9l1.5-.4 1 2z" /></svg></a>
              </div></div>
            <nav className="stack" aria-label="استكشف"><span className="ftr-h ar-k">استكشف</span><Link className="ftr-l" href="/ar">الرئيسية</Link><Link className="ftr-l" href="/about">من نحن</Link><Link className="ftr-l" href="/services">الخدمات</Link><Link className="ftr-l" href="/courses">الدورات</Link></nav>
            <nav className="stack" aria-label="الشبكة"><span className="ftr-h ar-k">الشبكة</span><Link className="ftr-l" href="/case-studies">دراسات الحالة</Link><Link className="ftr-l" href="/library">المكتبة</Link><Link className="ftr-l" href="/get-involved">شارك معنا</Link><Link className="ftr-l" href="/ar/membership">العضوية</Link></nav>
            <div className="stack"><span className="ftr-h ar-k">الدعم</span><ArA11yLink /><Link className="ftr-l" href="/privacy">سياسة الخصوصية</Link><div style={{ marginTop: '12px' }}><Link className="btn btn-sm btn-light" href="/contact">تواصل معنا</Link></div></div>
          </div>
          <div className="ftr-b"><span>© {new Date().getFullYear()} شبكة استدامة الرعاية الصحية</span></div>
        </div>
      </footer>
    </div>
  )
}
