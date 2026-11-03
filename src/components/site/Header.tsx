'use client'

// Ported from Header.dc.html. Markup, classes and inline styles match the design.
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { A11yPanel } from './A11yPanel'
import { OPEN_A11Y_EVENT } from './FooterA11yLink'
import { SOCIAL } from '@/lib/site'

export type HeaderMember = { name: string; initials: string; membershipType?: string | null }

const NAV: [string, string, string][] = [
  ['home', 'Home', '/'],
  ['about', 'About Us', '/about'],
  ['services', 'Services', '/services'],
  ['courses', 'Courses', '/courses'],
  ['cases', 'Case Studies', '/case-studies'],
  ['library', 'Library', '/library'],
  ['involved', 'Get Involved', '/get-involved'],
  ['membership', 'Membership', '/membership'],
]

function currentFromPath(pathname: string) {
  if (pathname === '/') return 'home'
  const hit = NAV.find(([, , href]) => href !== '/' && (pathname === href || pathname.startsWith(href + '/')))
  return hit ? hit[0] : 'none'
}

export function Header({ member = null }: { member?: HeaderMember | null }) {
  const pathname = usePathname() || '/'
  const cur = currentFromPath(pathname)
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [a11yOpen, setA11yOpen] = useState(false)

  // Close menus when the route changes.
  useEffect(() => {
    setOpen(false)
    setLangOpen(false)
    setJoinOpen(false)
  }, [pathname])

  // Alt + A opens the accessibility panel (shown in the button title in the design).
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

  const nav = NAV.map(([id, label, href]) => ({
    label,
    href,
    cls: id === cur ? 'nav cur' : 'nav',
    mcls: id === cur ? 'mrow cur' : 'mrow',
    ac: id === cur ? ('page' as const) : undefined,
  }))
  const guest = !member
  const toggleLang = () => {
    setLangOpen(!langOpen)
    setJoinOpen(false)
  }
  const toggleJoin = () => {
    setJoinOpen(!joinOpen)
    setLangOpen(false)
  }
  const openA11y = () => {
    setA11yOpen(true)
    setLangOpen(false)
    setOpen(false)
  }

  return (
    <div className="cq" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#17323A', width: '100%' }}>
      <header className="hdr">
        <div className="hdr-in">
          <Link className="logo" href="/" aria-label="Healthcare Sustainability Network, home">
            <span className="logo-m">
              <img src="/images/hsn-logo.jpg" alt="" />
            </span>
            <span className="logo-t">
              <span className="logo-1">HEALTHCARE</span>
              <span className="logo-2">SUSTAINABILITY NETWORK</span>
            </span>
          </Link>
          <nav className="nav-l lap" aria-label="Main">
            {nav.map((item) => (
              <Link key={item.href} className={item.cls} href={item.href} aria-current={item.ac}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="row nowrap g8">
            <span className="tabup" style={{ position: 'relative' }}>
              <button className="lang" aria-label="Language: English" aria-haspopup="menu" aria-expanded={langOpen} onClick={toggleLang}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"></path></svg>EN{' '}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
              </button>
              {langOpen && (
                <div role="menu" aria-label="Language" style={{ position: 'absolute', top: '50px', right: '0', zIndex: 30, width: '230px', padding: '6px', borderRadius: '12px', background: '#FFFDF8', border: '1px solid #D9D2C1', boxShadow: '0 8px 24px rgba(19,78,94,.14)' }}>
                  <Link role="menuitemradio" aria-checked="true" href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '48px', padding: '0 12px', borderRadius: '8px', background: '#E3F1E4', color: '#0B6B3A', fontWeight: 600, textDecoration: 'none' }}>English<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg></Link>
                  <span role="menuitemradio" aria-checked="false" aria-disabled="true" lang="hi" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '52px', padding: '0 12px', color: '#17323A' }}><span style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", fontSize: '17px' }}>हिन्दी</span><span style={{ fontSize: '13px', color: '#4A5F63' }} lang="en">Hindi · translation coming soon</span></span>
                  <Link role="menuitemradio" aria-checked="false" href="/ar" lang="ar" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '52px', padding: '0 12px', borderRadius: '8px', color: '#17323A', textDecoration: 'none' }}><span style={{ fontFamily: "'Noto Sans Arabic', sans-serif", fontSize: '18px' }}>العربية</span><span style={{ fontSize: '13px', color: '#4A5F63' }} lang="en">Arabic · right-to-left</span></Link>
                </div>
              )}
            </span>
            <button className="a11y" aria-label="Accessibility options" title="Accessibility options (Alt + A)" aria-haspopup="dialog" aria-expanded={a11yOpen} onClick={openA11y}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="4" r="1.8"></circle><path d="M11 7.5v6h5.5l2.5 5.5"></path><path d="M11 10.5h5"></path><path d="M8 10.8a6 6 0 1 0 8.3 7.2"></path></svg>
            </button>
            {guest && (
              <>
                <Link className="btn btn-sm btn-s lap" href="/login">Log in</Link>
                <span className="tabup" style={{ position: 'relative' }}>
                  <button className="btn btn-sm btn-p" aria-haspopup="menu" aria-expanded={joinOpen} onClick={toggleJoin}>Join HSN{' '}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>
                  {joinOpen && (
                    <div role="menu" aria-label="Join HSN" style={{ position: 'absolute', top: '50px', right: '0', zIndex: 30, width: '270px', padding: '6px', borderRadius: '12px', background: '#FFFDF8', border: '1px solid #D9D2C1', boxShadow: '0 8px 24px rgba(19,78,94,.14)' }}>
                      <a role="menuitem" className="join-item" href={SOCIAL.whatsapp} target="_blank" rel="noopener">
                        <span className="join-ic" style={{ background: '#E3F1E4', color: '#0B6B3A' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3.2 3.1z"></path><path d="M9 9.5c.3 2.3 2.2 4.2 4.5 4.5l1-1.2 2 1-.4 1.5c-3.6.3-7.2-3.3-6.9-6.9l1.5-.4 1 2z"></path></svg></span>
                        <span className="stack"><span>Join WhatsApp group</span><span className="join-sub">Opens WhatsApp</span></span>
                      </a>
                      <a role="menuitem" className="join-item" href={SOCIAL.linkedin} target="_blank" rel="noopener">
                        <span className="join-ic" style={{ background: '#DDF0F6', color: '#1C6E8A' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"></rect><path d="M8 10.5V17M8 7.5v.01M12 17v-6.5M12 13.5c0-1.7 1-3 2.5-3S17 11.5 17 13v4"></path></svg></span>
                        <span className="stack"><span>Follow on LinkedIn</span><span className="join-sub">Opens LinkedIn</span></span>
                      </a>
                    </div>
                  )}
                </span>
              </>
            )}
            {member && (
              <Link className="acct tabup" href="/my" aria-label={`My account, ${member.name}`}><span className="avatar" aria-hidden="true">{member.initials}</span><span>My HSN</span></Link>
            )}
            <button className="ico nolap" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
              {!open && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16"></path><path d="M4 12h16"></path><path d="M4 17h16"></path></svg>
              )}
              {open && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
              )}
            </button>
          </div>
        </div>
        {open && (
          <div className="msheet nolap">
            <nav aria-label="Main" className="stack g4" style={{ maxWidth: '560px', marginInline: 'auto' }}>
              {nav.map((item) => (
                <Link key={item.href} className={item.mcls} href={item.href} aria-current={item.ac}><span>{item.label}</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A5F63" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m9 6 6 6-6 6"></path></svg></Link>
              ))}
              {guest && (
                <div className="stack g12" style={{ padding: '20px 16px 8px', borderTop: '1px solid #D9D2C1', marginTop: '12px' }}>
                  <span className="small muted strong">Join HSN</span>
                  <a className="btn btn-p btn-lg" href={SOCIAL.whatsapp} target="_blank" rel="noopener">Join WhatsApp group</a>
                  <a className="btn btn-s btn-lg" href={SOCIAL.linkedin} target="_blank" rel="noopener">Follow on LinkedIn</a>
                  <Link className="btn btn-t btn-lg" href="/login">Log in</Link>
                </div>
              )}
              {member && (
                <div className="stack g12" style={{ padding: '20px 16px 8px', borderTop: '1px solid #D9D2C1', marginTop: '12px' }}>
                  <span className="row g12"><span className="avatar" aria-hidden="true">{member.initials}</span><span className="stack"><strong>{member.name}</strong>{member.membershipType && <span className="small muted">{member.membershipType}</span>}</span></span>
                  <Link className="btn btn-p btn-lg" href="/my">My dashboard</Link>
                  <a className="btn btn-s btn-lg" href="/api/auth/logout">Log out</a>
                </div>
              )}
              <div className="stack g8" style={{ padding: '12px 16px 0' }}>
                <span className="small muted strong">Language</span>
                <div className="seg" role="group" aria-label="Language">
                  <button className="on" aria-pressed="true" style={{ flex: 1 }}>English</button>
                  <button aria-pressed="false" lang="hi" disabled title="Hindi translation coming soon" style={{ flex: 1, fontFamily: "'Noto Sans Devanagari', sans-serif" }}>हिन्दी</button>
                  <Link href="/ar" lang="ar" style={{ flex: 1, fontFamily: "'Noto Sans Arabic', sans-serif" }}>العربية</Link>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>
      {a11yOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(14,31,34,.32)' }} onClick={() => setA11yOpen(false)} aria-hidden="true"></div>
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 61, width: '440px', maxWidth: '100%', overflowY: 'auto', background: '#FFFDF8' }}>
            <A11yPanel onClose={() => setA11yOpen(false)} />
          </div>
        </>
      )}
    </div>
  )
}
