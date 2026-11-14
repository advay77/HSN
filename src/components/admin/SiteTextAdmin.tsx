'use client'

import React, { useState, useTransition } from 'react'

import { saveSiteTextAction } from '@/app/(frontend)/admin/site-text/actions'
import type { ServiceLine, SiteCopy } from '@/lib/site/copy-defaults'

type TextKey = { [K in keyof SiteCopy]: SiteCopy[K] extends string ? K : never }[keyof SiteCopy]
type CardKey = { [K in keyof SiteCopy]: SiteCopy[K] extends ServiceLine[] ? K : never }[keyof SiteCopy]

type Field = { key: TextKey; label: string; area?: boolean; hint?: string }
type Group = { id: string; title: string; href: string; fields: Field[]; cards?: { key: CardKey; label: string }; after?: Field[] }

const GROUPS: Group[] = [
  {
    id: 'home', title: 'Home', href: '/',
    fields: [
      { key: 'homeTitle', label: 'Heading' },
      { key: 'homeSubtitle', label: 'Line under the heading' },
      { key: 'homeLead', label: 'Introduction', area: true },
    ],
    cards: { key: 'focus', label: 'Focus area' },
    after: [
      { key: 'communityTitle', label: 'Community heading' },
      { key: 'communityText', label: 'Community text', area: true },
      { key: 'goalTitle', label: 'Goal heading' },
      { key: 'goalText', label: 'Goal text', area: true },
    ],
  },
  {
    id: 'about', title: 'About Us', href: '/about',
    fields: [
      { key: 'aboutIntro', label: 'About Us', area: true },
      { key: 'mission', label: 'Our Mission', area: true },
      { key: 'purpose', label: 'Our Purpose', area: true },
      { key: 'story', label: 'Our Story', area: true, hint: 'Leave a blank line between paragraphs.' },
      { key: 'team', label: 'Our Team', area: true },
      { key: 'partnersIntro', label: 'Our Partners introduction', area: true },
    ],
    cards: { key: 'partners', label: 'Partner' },
  },
  { id: 'advisory', title: 'Advisory Board', href: '/advisory', fields: [{ key: 'advisoryTitle', label: 'Page heading' }] },
  { id: 'team', title: 'Our Team page', href: '/founder', fields: [{ key: 'teamPageTitle', label: 'Page heading', hint: 'The people themselves are edited in Our Team.' }] },
  { id: 'services', title: 'Our Services', href: '/services', fields: [], cards: { key: 'services', label: 'Service' } },
  { id: 'courses', title: 'Courses', href: '/courses', fields: [{ key: 'coursesTitle', label: 'Page heading', hint: 'Each course is edited in Courses.' }] },
  {
    id: 'cases', title: 'Case Studies', href: '/case-studies',
    fields: [
      { key: 'caseStudiesTitle', label: 'Page heading' },
      { key: 'caseStudiesMenu', label: 'Menu name', hint: 'Shown in the menu and the footer.' },
      { key: 'caseStudiesIntro', label: 'Line under the heading', area: true },
      { key: 'submitTitle', label: 'Submit page heading' },
    ],
  },
  { id: 'library', title: 'Library', href: '/library', fields: [{ key: 'libraryTitle', label: 'Page heading' }, { key: 'libraryIntro', label: 'Introduction', area: true, hint: 'The files are edited in Library.' }] },
  {
    id: 'involved', title: 'Get Involved', href: '/get-involved',
    fields: [
      { key: 'involvedTitle', label: 'Page heading' },
      { key: 'involvedIntro', label: 'Introduction', area: true },
      { key: 'involvedPros', label: 'Professionals heading' },
      { key: 'involvedHospitals', label: 'Hospitals heading' },
      { key: 'involvedResearchers', label: 'Researchers heading' },
      { key: 'involvedJumpPros', label: 'Jump link: professionals' },
      { key: 'involvedJumpHospitals', label: 'Jump link: hospitals' },
      { key: 'involvedJumpResearchers', label: 'Jump link: researchers' },
    ],
    cards: { key: 'involved', label: 'Option' },
  },
  { id: 'membership', title: 'Membership', href: '/membership', fields: [
    { key: 'membershipTitle', label: 'Page heading' },
    { key: 'membershipIntro', label: 'Introduction', area: true },
    { key: 'membershipCompareTitle', label: 'Compare table heading' },
    { key: 'membershipPriceSoon', label: 'Shown when a plan has no price' },
    { key: 'membershipCta', label: 'Button before payment is open' },
    { key: 'membershipCtaLive', label: 'Button when payment is open' },
    { key: 'membershipNote', label: 'Note under the plans', area: true },
    { key: 'membershipTiersHeading', label: 'Plans heading for screen readers' },
    { key: 'membershipRegion', label: 'Region label' },
    { key: 'membershipPrices', label: 'Region help text', hint: 'Use {currency} and {country} where the live values should appear.' },
    { key: 'membershipPerYear', label: 'Text after the price' },
    { key: 'membershipBenefit', label: 'Compare table first column' },
  ]},
  { id: 'contact', title: 'Contact', href: '/contact', fields: [{ key: 'contactTitle', label: 'Page heading' }, { key: 'contactIntro', label: 'Introduction', area: true }, { key: 'contactEmailLabel', label: 'Email card heading' }] },
  { id: 'feedback', title: 'Feedback', href: '/feedback', fields: [{ key: 'feedbackTitle', label: 'Page heading' }, { key: 'feedbackIntro', label: 'Introduction', area: true }, { key: 'feedbackTab', label: 'Button on the edge of every page' }] },
  { id: 'privacy', title: 'Privacy Policy', href: '/privacy', fields: [] },
  { id: 'menu', title: 'Menu', href: '/', fields: [] },
  { id: 'footer', title: 'Footer', href: '/', fields: [{ key: 'footerTagline', label: 'Line under the logo' }] },
]

export function SiteTextAdmin({ initial }: { initial: SiteCopy }) {
  const [f, setF] = useState(initial)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const setText = (key: TextKey, value: string) => setF((x) => ({ ...x, [key]: value }))
  const setNav = (key: keyof SiteCopy['nav'], value: string) => setF((x) => ({ ...x, nav: { ...x.nav, [key]: value } }))
  const setFooter = (key: keyof SiteCopy['footer'], value: string) => setF((x) => ({ ...x, footer: { ...x.footer, [key]: value } }))
  const setTier = (index: number, patch: Partial<SiteCopy['tiers'][number]>) => setF((x) => ({ ...x, tiers: x.tiers.map((row, i) => (i === index ? { ...row, ...patch } : row)) }))
  const setCompare = (index: number, patch: Partial<SiteCopy['compare'][number]>) => setF((x) => ({ ...x, compare: x.compare.map((row, i) => (i === index ? { ...row, ...patch } : row)) }))
  const menuFields: [keyof SiteCopy['nav'], string][] = [
    ['home', 'Home'], ['about', 'About Us menu name'], ['aboutPage', 'About Us link name'], ['aboutBlurb', 'About Us subtitle'],
    ['advisory', 'Advisory Board'], ['advisoryBlurb', 'Advisory Board subtitle'], ['team', 'Our Team'], ['teamBlurb', 'Our Team subtitle'],
    ['courses', 'Courses'], ['services', 'Services'], ['resources', 'Resources menu name'], ['casesBlurb', 'Case studies subtitle'],
    ['library', 'Library'], ['libraryBlurb', 'Library subtitle'], ['join', 'Join button'],
    ['whatsapp', 'WhatsApp link'], ['whatsappBlurb', 'WhatsApp subtitle'], ['linkedin', 'LinkedIn link'], ['linkedinBlurb', 'LinkedIn subtitle'],
    ['membership', 'Membership'], ['membershipBlurb', 'Membership subtitle'], ['involved', 'Get Involved'], ['involvedBlurb', 'Get Involved subtitle'],
    ['login', 'Log in'], ['myHsn', 'My HSN'], ['dashboard', 'My dashboard'], ['logout', 'Log out'], ['joinShort', 'Join heading on small screens'], ['logo1', 'Logo line 1'], ['logo2', 'Logo line 2'],
  ]
  const buttonLabels = ['Join the community', 'Start with the SusQI course', 'See institutional membership', 'Plan a workshop', 'Submit a case study', 'Offer to speak']
  const privacyFields: [keyof SiteCopy['privacy'], string][] = [
    ['title', 'Page heading'], ['date', 'Effective date'], ['readTime', 'Reading time'], ['contents', 'Contents label'], ['lead', 'Introduction'],
    ['s1', 'Section 1 heading'], ['s1intro', 'Section 1 introduction'], ['c1t', 'Contact information title'], ['c1d', 'Contact information text'],
    ['c2t', 'Professional details title'], ['c2d', 'Professional details text'], ['c3t', 'Communications title'], ['c3d', 'Communications text'],
    ['s2', 'Section 2 heading'], ['s2intro', 'Section 2 introduction'], ['s2a', 'Use 1'], ['s2b', 'Use 2'], ['s2c', 'Use 3'], ['s2d', 'Use 4'],
    ['s3', 'Section 3 heading'], ['s3note', 'Highlighted note'], ['s3body', 'Section 3 text'],
    ['s4', 'Section 4 heading'], ['s4body', 'Section 4 text'],
    ['s5', 'Section 5 heading'], ['s5a', 'Opt-out title'], ['s5ad', 'Opt-out text'], ['s5b', 'Access title'], ['s5bd', 'Access text'],
    ['s6', 'Section 6 heading'], ['s6body', 'Section 6 text'], ['s7', 'Section 7 heading'], ['s7body', 'Section 7 text'],
  ]
  const footerFields: [keyof SiteCopy['footer'], string][] = [
    ['explore', 'Explore column title'], ['network', 'Network column title'], ['support', 'Support column title'],
    ['home', 'Home'], ['about', 'About Us'], ['advisory', 'Advisory Board'], ['team', 'Our Team'], ['services', 'Services'], ['courses', 'Courses'],
    ['library', 'Library'], ['involved', 'Get Involved'], ['membership', 'Membership'], ['login', 'Log in'],
    ['accessibility', 'Accessibility'], ['feedback', 'Feedback'], ['privacy', 'Privacy Policy'], ['contact', 'Contact us'], ['copyright', 'Copyright name'],
  ]
  const setCard = (key: CardKey, i: number, patch: Partial<ServiceLine>) =>
    setF((x) => ({ ...x, [key]: x[key].map((row, n) => (n === i ? { ...row, ...patch } : row)) }))

  const save = () => {
    setError('')
    setNote('')
    start(async () => {
      const r = await saveSiteTextAction(f)
      if (!r.ok) return setError(r.error)
      setNote('Saved. The new wording is on the website.')
    })
  }

  const fields = (list: Field[]) => list.map((field) => (
    <div className="fld" key={field.key}>
      <label className="lbl" htmlFor={`st-${field.key}`}>{field.label}</label>
      {field.area
        ? <textarea className="inp" id={`st-${field.key}`} value={f[field.key]} onChange={(e) => setText(field.key, e.target.value)} style={{ minHeight: field.key === 'story' ? '220px' : '90px' }} />
        : <input className="inp" id={`st-${field.key}`} value={f[field.key]} onChange={(e) => setText(field.key, e.target.value)} />}
      {field.hint && <span className="hint">{field.hint}</span>}
    </div>
  ))

  return (
    <div className="stack g24">
      <p className="muted" style={{ margin: 0, maxWidth: '720px' }}>Every page below can be edited here. Type the new wording and click Save. Courses, team members, advisors, case studies and library files have their own sections in the menu.</p>
      <nav className="row g8" aria-label="Pages" style={{ flexWrap: 'wrap' }}>
        {GROUPS.map((g) => <a key={g.id} className="btn btn-s btn-sm" href={`#st-${g.id}`}>{g.title}</a>)}
      </nav>
      {note && <div className="note note-ok" role="status"><span>{note}</span></div>}

      {GROUPS.map((g) => (
        <section key={g.id} className="card pad-l stack g16" id={`st-${g.id}`} aria-labelledby={`sth-${g.id}`}>
          <div className="row between g12" style={{ alignItems: 'center' }}>
            <h2 className="h3" id={`sth-${g.id}`} style={{ margin: 0 }}>{g.title}</h2>
            <a className="btn btn-s btn-sm" href={g.href} target="_blank" rel="noopener">View page</a>
          </div>
          {fields(g.fields)}
          {g.cards && f[g.cards.key].map((row, i) => (
            <div key={`${g.cards!.key}-${i}`} className="stack g12" style={{ paddingTop: '8px', borderTop: '1px solid #EDE7D8' }}>
              <div className="fld"><label className="lbl" htmlFor={`st-${g.cards!.key}-t-${i}`}>{g.cards!.label} {i + 1} title</label><input className="inp" id={`st-${g.cards!.key}-t-${i}`} value={row.title} onChange={(e) => setCard(g.cards!.key, i, { title: e.target.value })} /></div>
              <div className="fld"><label className="lbl" htmlFor={`st-${g.cards!.key}-s-${i}`}>{g.cards!.label} {i + 1} text</label><textarea className="inp" id={`st-${g.cards!.key}-s-${i}`} value={row.summary} onChange={(e) => setCard(g.cards!.key, i, { summary: e.target.value })} style={{ minHeight: '80px' }} /></div>
            </div>
          ))}
          {g.after && fields(g.after)}
          {g.id === 'involved' && f.involvedButtons.map((label, i) => (
            <div className="fld" key={`btn-${i}`}><label className="lbl" htmlFor={`ib-${i}`}>Button {i + 1}</label><input className="inp" id={`ib-${i}`} value={label} onChange={(e) => setF((x) => ({ ...x, involvedButtons: x.involvedButtons.map((item, n) => n === i ? e.target.value : item) })) } /><span className="hint">{buttonLabels[i]}</span></div>
          ))}
          {g.id === 'privacy' && privacyFields.map(([key, label]) => (
            <div className="fld" key={key}>
              <label className="lbl" htmlFor={`pv-${key}`}>{label}</label>
              {['lead', 's1intro', 's2intro', 's3body', 's4body', 's5ad', 's5bd', 's6body', 's7body', 's3note'].includes(key)
                ? <textarea className="inp" id={`pv-${key}`} value={f.privacy[key]} onChange={(e) => setF((x) => ({ ...x, privacy: { ...x.privacy, [key]: e.target.value } }))} style={{ minHeight: '90px' }} />
                : <input className="inp" id={`pv-${key}`} value={f.privacy[key]} onChange={(e) => setF((x) => ({ ...x, privacy: { ...x.privacy, [key]: e.target.value } }))} />}
            </div>
          ))}
          {g.id === 'membership' && f.tiers.map((tier, i) => (
            <div key={`tier-${i}`} className="stack g12" style={{ paddingTop: '8px', borderTop: '1px solid #EDE7D8' }}>
              <div className="fld"><label className="lbl" htmlFor={`tier-n-${i}`}>Plan {i + 1} name</label><input className="inp" id={`tier-n-${i}`} value={tier.name} onChange={(e) => setTier(i, { name: e.target.value })} /></div>
              <div className="fld"><label className="lbl" htmlFor={`tier-t-${i}`}>Plan {i + 1} tag</label><input className="inp" id={`tier-t-${i}`} value={tier.tag} onChange={(e) => setTier(i, { tag: e.target.value })} /></div>
              <div className="fld"><label className="lbl" htmlFor={`tier-b-${i}`}>Plan {i + 1} text</label><textarea className="inp" id={`tier-b-${i}`} value={tier.blurb} onChange={(e) => setTier(i, { blurb: e.target.value })} style={{ minHeight: '80px' }} /></div>
              <div className="fld"><label className="lbl" htmlFor={`tier-f-${i}`}>Plan {i + 1} points, one per line</label><textarea className="inp" id={`tier-f-${i}`} value={tier.features} onChange={(e) => setTier(i, { features: e.target.value })} style={{ minHeight: '120px' }} /></div>
            </div>
          ))}
          {g.id === 'membership' && f.compare.map((row, i) => (
            <div key={`cmp-${i}`} className="stack g12" style={{ paddingTop: '8px', borderTop: '1px solid #EDE7D8' }}>
              <div className="fld"><label className="lbl" htmlFor={`cmp-b-${i}`}>Compare row {i + 1}</label><input className="inp" id={`cmp-b-${i}`} value={row.benefit} onChange={(e) => setCompare(i, { benefit: e.target.value })} /></div>
              <div className="row g12" style={{ flexWrap: 'wrap' }}>
                <div className="fld" style={{ flex: '1 1 180px' }}><label className="lbl" htmlFor={`cmp-s-${i}`}>Student</label><input className="inp" id={`cmp-s-${i}`} value={row.student} onChange={(e) => setCompare(i, { student: e.target.value })} /></div>
                <div className="fld" style={{ flex: '1 1 180px' }}><label className="lbl" htmlFor={`cmp-i-${i}`}>Individual</label><input className="inp" id={`cmp-i-${i}`} value={row.individual} onChange={(e) => setCompare(i, { individual: e.target.value })} /></div>
                <div className="fld" style={{ flex: '1 1 180px' }}><label className="lbl" htmlFor={`cmp-n-${i}`}>Institutional</label><input className="inp" id={`cmp-n-${i}`} value={row.institutional} onChange={(e) => setCompare(i, { institutional: e.target.value })} /></div>
              </div>
            </div>
          ))}
          {g.id === 'menu' && menuFields.map(([key, label]) => (
            <div className="fld" key={key}><label className="lbl" htmlFor={`nav-${key}`}>{label}</label><input className="inp" id={`nav-${key}`} value={f.nav[key]} onChange={(e) => setNav(key, e.target.value)} /></div>
          ))}
          {g.id === 'footer' && footerFields.map(([key, label]) => (
            <div className="fld" key={key}><label className="lbl" htmlFor={`ft-${key}`}>{label}</label><input className="inp" id={`ft-${key}`} value={f.footer[key]} onChange={(e) => setFooter(key, e.target.value)} /></div>
          ))}
        </section>
      ))}

      {error && <div className="note note-err" role="alert"><span>{error}</span></div>}
      <button className="btn btn-p self-start" onClick={save} disabled={pending}>{pending ? 'Saving…' : 'Save page text'}</button>
    </div>
  )
}
