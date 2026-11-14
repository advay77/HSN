'use client'

import React, { useEffect, useRef, useState, useTransition } from 'react'

import { previewSiteTextAction, saveSiteTextAction } from '@/app/(frontend)/admin/site-text/actions'
import { SITE_FONTS, type ServiceLine, type SiteCopy } from '@/lib/site/copy-defaults'

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
  const [page, setPage] = useState('home')
  const [frame, setFrame] = useState(0)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const frameRef = useRef<HTMLIFrameElement>(null)
  const dirty = useRef(false)
  const mark = (next: SiteCopy) => {
    dirty.current = true
    return next
  }
  const setText = (key: TextKey, value: string) => setF((x) => mark({ ...x, [key]: value }))
  const setNav = (key: keyof SiteCopy['nav'], value: string) => setF((x) => mark({ ...x, nav: { ...x.nav, [key]: value } }))
  const setFooter = (key: keyof SiteCopy['footer'], value: string) => setF((x) => mark({ ...x, footer: { ...x.footer, [key]: value } }))
  const setTier = (index: number, patch: Partial<SiteCopy['tiers'][number]>) => setF((x) => mark({ ...x, tiers: x.tiers.map((row, i) => (i === index ? { ...row, ...patch } : row)) }))
  const setCompare = (index: number, patch: Partial<SiteCopy['compare'][number]>) => setF((x) => mark({ ...x, compare: x.compare.map((row, i) => (i === index ? { ...row, ...patch } : row)) }))
  const setDesign = (patch: Partial<SiteCopy['design']>) => setF((x) => mark({ ...x, design: { ...x.design, ...patch } }))
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
    setF((x) => mark({ ...x, [key]: x[key].map((row, n) => (n === i ? { ...row, ...patch } : row)) }))

  const showDesign = () => frameRef.current?.contentWindow?.postMessage({ type: 'hsn-design', design: f.design }, window.location.origin)

  useEffect(() => {
    showDesign()
  })

  useEffect(() => {
    if (!dirty.current) return
    const timer = window.setTimeout(() => {
      void previewSiteTextAction(f).then((r) => {
        if (r.ok) setFrame((n) => n + 1)
      })
    }, 700)
    return () => window.clearTimeout(timer)
  }, [f])

  const save = () => {
    setError('')
    setNote('')
    start(async () => {
      const r = await saveSiteTextAction(f)
      if (!r.ok) return setError(r.error)
      dirty.current = false
      setFrame((n) => n + 1)
      setNote('Saved. The website now looks like this.')
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

  const group = GROUPS.find((item) => item.id === page) || GROUPS[0]!
  const previewSrc = `${group.href}${group.href.includes('?') ? '&' : '?'}hsnpreview=1&v=${frame}`
  const fontSelect = (label: string, value: string, onChange: (value: string) => void, allowSame = false) => (
    <div className="fld">
      <label className="lbl">{label}</label>
      <select className="inp" value={value} onChange={(e) => onChange(e.target.value)}>
        {allowSame && <option value="">Same as the whole website</option>}
        {SITE_FONTS.map((font) => <option key={font.id} value={font.id} style={{ fontFamily: font.stack }}>{font.label}</option>)}
      </select>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px minmax(0, 1fr)', gap: '16px', minHeight: 'calc(100vh - 120px)' }}>
      <aside className="stack g16">
        <nav className="stack g4" aria-label="Pages">
          {GROUPS.map((g) => (
            <button key={g.id} type="button" className={g.id === page ? 'btn btn-p btn-sm' : 'btn btn-s btn-sm'} onClick={() => setPage(g.id)} style={{ justifyContent: 'flex-start' }}>{g.title}</button>
          ))}
        </nav>
        <div className="card pad stack g12">
          <h2 className="h4" style={{ margin: 0 }}>Look</h2>
          {fontSelect('Font for the whole website', f.design.body, (body) => setDesign({ body }))}
          {fontSelect('Font for headings', f.design.heading, (heading) => setDesign({ heading }))}
          {page !== 'menu' && page !== 'footer' && fontSelect('Font for this page only', f.design.pages[page] || '', (value) => setDesign({ pages: { ...f.design.pages, [page]: value } }), true)}
          <div className="fld">
            <label className="lbl" htmlFor="st-gap">Space between sections</label>
            <input id="st-gap" type="range" min={56} max={140} value={f.design.gap} onChange={(e) => setDesign({ gap: Number(e.target.value) })} />
            <span className="hint">{f.design.gap < 80 ? 'Tight' : f.design.gap > 110 ? 'Roomy' : 'Normal'}</span>
          </div>
        </div>
        {note && <div className="note note-ok" role="status"><span>{note}</span></div>}
        {error && <div className="note note-err" role="alert"><span>{error}</span></div>}
        <button className="btn btn-p" onClick={save} disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
      </aside>
      <div className="stack g12" style={{ minWidth: 0 }}>
        <iframe ref={frameRef} title={`${group.title} preview`} src={previewSrc} onLoad={showDesign} style={{ width: '100%', flex: '1 1 auto', minHeight: '420px', border: '1px solid #D9D2C1', borderRadius: '16px', background: '#FFFDF8' }} />
        <section className="card pad stack g12" style={{ maxHeight: '34vh', overflow: 'auto' }} aria-labelledby="st-edit">
          <h2 className="h3" id="st-edit" style={{ margin: 0 }}>{group.title}</h2>
          {fields(group.fields)}
          {group.cards && f[group.cards.key].map((row, i) => (
            <div key={`${group.cards!.key}-${i}`} className="stack g12" style={{ paddingTop: '8px', borderTop: '1px solid #EDE7D8' }}>
              <div className="fld"><label className="lbl" htmlFor={`st-${group.cards!.key}-t-${i}`}>{group.cards!.label} {i + 1} title</label><input className="inp" id={`st-${group.cards!.key}-t-${i}`} value={row.title} onChange={(e) => setCard(group.cards!.key, i, { title: e.target.value })} /></div>
              <div className="fld"><label className="lbl" htmlFor={`st-${group.cards!.key}-s-${i}`}>{group.cards!.label} {i + 1} text</label><textarea className="inp" id={`st-${group.cards!.key}-s-${i}`} value={row.summary} onChange={(e) => setCard(group.cards!.key, i, { summary: e.target.value })} style={{ minHeight: '80px' }} /></div>
            </div>
          ))}
          {group.after && fields(group.after)}
          {group.id === 'involved' && f.involvedButtons.map((label, i) => (
            <div className="fld" key={`btn-${i}`}><label className="lbl" htmlFor={`ib-${i}`}>Button {i + 1}</label><input className="inp" id={`ib-${i}`} value={label} onChange={(e) => setF((x) => mark({ ...x, involvedButtons: x.involvedButtons.map((item, n) => n === i ? e.target.value : item) })) } /><span className="hint">{buttonLabels[i]}</span></div>
          ))}
          {group.id === 'privacy' && privacyFields.map(([key, label]) => (
            <div className="fld" key={key}>
              <label className="lbl" htmlFor={`pv-${key}`}>{label}</label>
              {['lead', 's1intro', 's2intro', 's3body', 's4body', 's5ad', 's5bd', 's6body', 's7body', 's3note'].includes(key)
                ? <textarea className="inp" id={`pv-${key}`} value={f.privacy[key]} onChange={(e) => setF((x) => mark({ ...x, privacy: { ...x.privacy, [key]: e.target.value } }))} style={{ minHeight: '90px' }} />
                : <input className="inp" id={`pv-${key}`} value={f.privacy[key]} onChange={(e) => setF((x) => mark({ ...x, privacy: { ...x.privacy, [key]: e.target.value } }))} />}
            </div>
          ))}
          {group.id === 'membership' && f.tiers.map((tier, i) => (
            <div key={`tier-${i}`} className="stack g12" style={{ paddingTop: '8px', borderTop: '1px solid #EDE7D8' }}>
              <div className="fld"><label className="lbl" htmlFor={`tier-n-${i}`}>Plan {i + 1} name</label><input className="inp" id={`tier-n-${i}`} value={tier.name} onChange={(e) => setTier(i, { name: e.target.value })} /></div>
              <div className="fld"><label className="lbl" htmlFor={`tier-t-${i}`}>Plan {i + 1} tag</label><input className="inp" id={`tier-t-${i}`} value={tier.tag} onChange={(e) => setTier(i, { tag: e.target.value })} /></div>
              <div className="fld"><label className="lbl" htmlFor={`tier-b-${i}`}>Plan {i + 1} text</label><textarea className="inp" id={`tier-b-${i}`} value={tier.blurb} onChange={(e) => setTier(i, { blurb: e.target.value })} style={{ minHeight: '80px' }} /></div>
              <div className="fld"><label className="lbl" htmlFor={`tier-f-${i}`}>Plan {i + 1} points, one per line</label><textarea className="inp" id={`tier-f-${i}`} value={tier.features} onChange={(e) => setTier(i, { features: e.target.value })} style={{ minHeight: '120px' }} /></div>
            </div>
          ))}
          {group.id === 'membership' && f.compare.map((row, i) => (
            <div key={`cmp-${i}`} className="stack g12" style={{ paddingTop: '8px', borderTop: '1px solid #EDE7D8' }}>
              <div className="fld"><label className="lbl" htmlFor={`cmp-b-${i}`}>Compare row {i + 1}</label><input className="inp" id={`cmp-b-${i}`} value={row.benefit} onChange={(e) => setCompare(i, { benefit: e.target.value })} /></div>
              <div className="row g12" style={{ flexWrap: 'wrap' }}>
                <div className="fld" style={{ flex: '1 1 180px' }}><label className="lbl" htmlFor={`cmp-s-${i}`}>Student</label><input className="inp" id={`cmp-s-${i}`} value={row.student} onChange={(e) => setCompare(i, { student: e.target.value })} /></div>
                <div className="fld" style={{ flex: '1 1 180px' }}><label className="lbl" htmlFor={`cmp-i-${i}`}>Individual</label><input className="inp" id={`cmp-i-${i}`} value={row.individual} onChange={(e) => setCompare(i, { individual: e.target.value })} /></div>
                <div className="fld" style={{ flex: '1 1 180px' }}><label className="lbl" htmlFor={`cmp-n-${i}`}>Institutional</label><input className="inp" id={`cmp-n-${i}`} value={row.institutional} onChange={(e) => setCompare(i, { institutional: e.target.value })} /></div>
              </div>
            </div>
          ))}
          {group.id === 'menu' && menuFields.map(([key, label]) => (
            <div className="fld" key={key}><label className="lbl" htmlFor={`nav-${key}`}>{label}</label><input className="inp" id={`nav-${key}`} value={f.nav[key]} onChange={(e) => setNav(key, e.target.value)} /></div>
          ))}
          {group.id === 'footer' && footerFields.map(([key, label]) => (
            <div className="fld" key={key}><label className="lbl" htmlFor={`ft-${key}`}>{label}</label><input className="inp" id={`ft-${key}`} value={f.footer[key]} onChange={(e) => setFooter(key, e.target.value)} /></div>
          ))}
        </section>
      </div>
    </div>
  )
}
