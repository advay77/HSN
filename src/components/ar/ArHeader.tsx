'use client'

// Arabic header, ported from the header block in HomeAr.dc.html (right-to-left).
// Only Home and Membership exist in Arabic; the other menu items open the English pages.
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { A11yPanel } from '@/components/site/A11yPanel'
import { OPEN_A11Y_EVENT } from '@/components/site/FooterA11yLink'
import { SOCIAL } from '@/lib/site'

export const AR_NAV: [string, string][] = [
  ['الرئيسية', '/ar'],
  ['من نحن', '/about'],
  ['الخدمات', '/services'],
  ['الدورات', '/courses'],
  ['دراسات الحالة', '/case-studies'],
  ['المكتبة', '/library'],
  ['شارك معنا', '/get-involved'],
  ['العضوية', '/ar/membership'],
]

// The English page that matches the current Arabic page, for the language menu.
const englishFor = (path: string) => (path.startsWith('/ar/') ? path.slice(3) : '/')

export function ArHeader({ member = null }: { member?: { name: string; initials: string } | null }) {
  const pathname = usePathname() || '/ar'
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [a11yOpen, setA11yOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
    setLangOpen(false)
    setJoinOpen(false)
  }, [pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault()
        setA11yOpen(true)
      }
      if (e.key === 'Escape') {
        setLangOpen(false)
        setJoinOpen(false)
        setA11yOpen(false)
      }
    }
    const onOpen = () => setA11yOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_A11Y_EVENT, onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_A11Y_EVENT, onOpen)
    }
  }, [])

  const isCur = (href: string) => pathname === href

  return (
    <>
      <div className="cq">
        <header className="hdr">
          <div className="hdr-in">
            <Link className="logo" href="/ar" aria-label="شبكة استدامة الرعاية الصحية، الرئيسية">
              <span className="logo-m"><img src="/images/hsn-logo.jpg" alt="" /></span>
              <span className="logo-t"><span className="ar-k" style={{ fontWeight: 800, fontSize: '16px', lineHeight: '22px', color: '#0B6B3A' }}>شبكة استدامة</span><span className="ar-k" style={{ fontWeight: 700, fontSize: '12px', lineHeight: '18px', color: '#134E5E' }}>الرعاية الصحية</span></span>
            </Link>
            <nav className="nav-l lap" aria-label="القائمة الرئيسية">
              {AR_NAV.map(([label, href]) => (
                <Link key={href} className={isCur(href) ? 'nav cur' : 'nav'} href={href} aria-current={isCur(href) ? 'page' : undefined}>{label}</Link>
              ))}
            </nav>
            <div className="row nowrap g8">
              <button className="lang tabup" aria-label="اللغة: العربية" aria-haspopup="menu" aria-expanded={langOpen} onClick={() => { setLangOpen(!langOpen); setJoinOpen(false) }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"></path></svg>العربية</button>
              <span style={{ position: 'relative', width: 0, height: 0 }}>
                {langOpen && (
                  <span role="menu" aria-label="اللغة" style={{ position: 'absolute', top: '30px', left: 0, zIndex: 30, width: '230px', padding: '6px', borderRadius: '12px', background: '#FFFDF8', border: '1px solid #D9D2C1', boxShadow: '0 8px 24px rgba(19,78,94,.14)', display: 'flex', flexDirection: 'column' }}>
                    <Link role="menuitemradio" aria-checked="false" href={englishFor(pathname)} lang="en" dir="ltr" style={{ display: 'flex', alignItems: 'center', minHeight: '48px', padding: '0 12px', borderRadius: '8px', color: '#17323A', textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>English</Link>
                    <span role="menuitemradio" aria-checked="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '48px', padding: '0 12px', borderRadius: '8px', background: '#E3F1E4', color: '#0B6B3A', fontWeight: 600 }}>العربية<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg></span>
                  </span>
                )}
              </span>
              <button className="a11y" aria-label="خيارات إمكانية الوصول" aria-haspopup="dialog" aria-expanded={a11yOpen} onClick={() => { setA11yOpen(true); setLangOpen(false); setJoinOpen(false) }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="4" r="1.8"></circle><path d="M11 7.5v6h5.5l2.5 5.5"></path><path d="M11 10.5h5"></path><path d="M8 10.8a6 6 0 1 0 8.3 7.2"></path></svg></button>
              {member ? (
                <Link className="acct tabup" href="/my" aria-label={`حسابي، ${member.name}`}><span className="avatar" aria-hidden="true">{member.initials}</span><span>حسابي</span></Link>
              ) : (
                <>
                  <Link className="btn btn-sm btn-s lap" href="/login">تسجيل الدخول</Link>
                  <span className="tabup" style={{ position: 'relative' }}>
                    <button className="btn btn-sm btn-p" aria-haspopup="menu" aria-expanded={joinOpen} onClick={() => { setJoinOpen(!joinOpen); setLangOpen(false) }}>انضم إلى HSN<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>
                    {joinOpen && (
                      <div role="menu" aria-label="انضم إلى HSN" style={{ position: 'absolute', top: '50px', left: 0, zIndex: 30, width: '270px', padding: '6px', borderRadius: '12px', background: '#FFFDF8', border: '1px solid #D9D2C1', boxShadow: '0 8px 24px rgba(19,78,94,.14)' }}>
                        <a role="menuitem" className="join-item" href={SOCIAL.whatsapp} target="_blank" rel="noopener">
                          <span className="join-ic" style={{ background: '#E3F1E4', color: '#0B6B3A' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3.2 3.1z"></path><path d="M9 9.5c.3 2.3 2.2 4.2 4.5 4.5l1-1.2 2 1-.4 1.5c-3.6.3-7.2-3.3-6.9-6.9l1.5-.4 1 2z"></path></svg></span>
                          <span className="stack"><span>انضم إلى مجموعة واتساب</span><span className="join-sub">يفتح واتساب</span></span>
                        </a>
                        <a role="menuitem" className="join-item" href={SOCIAL.linkedin} target="_blank" rel="noopener">
                          <span className="join-ic" style={{ background: '#DDF0F6', color: '#1C6E8A' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"></rect><path d="M8 10.5V17M8 7.5v.01M12 17v-6.5M12 13.5c0-1.7 1-3 2.5-3S17 11.5 17 13v4"></path></svg></span>
                          <span className="stack"><span>تابعنا على لينكدإن</span><span className="join-sub">يفتح لينكدإن</span></span>
                        </a>
                      </div>
                    )}
                  </span>
                </>
              )}
              <button className="ico nolap" aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={open} onClick={() => setOpen(!open)}>
                {open ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16"></path><path d="M4 12h16"></path><path d="M4 17h16"></path></svg>
                )}
              </button>
            </div>
          </div>
          {/* Mobile menu: the Arabic design shows only the menu button; this reuses the English sheet's classes, mirrored. */}
          {open && (
            <div className="msheet nolap">
              <nav aria-label="القائمة الرئيسية" className="stack g4" style={{ maxWidth: '560px', marginInline: 'auto' }}>
                {AR_NAV.map(([label, href]) => (
                  <Link key={href} className={isCur(href) ? 'mrow cur' : 'mrow'} href={href} aria-current={isCur(href) ? 'page' : undefined}><span>{label}</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A5F63" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m15 6-6 6 6 6"></path></svg></Link>
                ))}
                <div className="stack g12" style={{ padding: '20px 16px 8px', borderTop: '1px solid #D9D2C1', marginTop: '12px' }}>
                  {member ? (
                    <Link className="btn btn-p btn-lg" href="/my">حسابي</Link>
                  ) : (
                    <>
                      <a className="btn btn-p btn-lg" href={SOCIAL.whatsapp} target="_blank" rel="noopener">انضم إلى مجموعة واتساب</a>
                      <a className="btn btn-s btn-lg" href={SOCIAL.linkedin} target="_blank" rel="noopener">تابعنا على لينكدإن</a>
                      <Link className="btn btn-t btn-lg" href="/login">تسجيل الدخول</Link>
                    </>
                  )}
                </div>
                <div className="stack g8" style={{ padding: '12px 16px 0' }}>
                  <div className="seg" role="group" aria-label="اللغة">
                    <Link href={englishFor(pathname)} lang="en" dir="ltr" style={{ flex: 1, fontFamily: 'Inter, sans-serif' }}>English</Link>
                    <button className="on" aria-pressed="true" style={{ flex: 1 }}>العربية</button>
                  </div>
                </div>
              </nav>
            </div>
          )}
        </header>
      </div>
      {a11yOpen && (
        <>
          <div className="a11y-scrim" style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(14,31,34,.32)' }} onClick={() => setA11yOpen(false)} aria-hidden="true"></div>
          <div dir="ltr" lang="en" style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 61, width: '440px', maxWidth: '100%', overflowY: 'auto', background: '#FFFDF8' }}>
            <A11yPanel onClose={() => setA11yOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}
