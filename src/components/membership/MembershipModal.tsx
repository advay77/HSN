'use client'

// "Register Interest" modal from Membership.dc.html / Membership-Modal.dc.html, shared by the English and Arabic pages.
import React, { useActionState, useEffect, useRef, startTransition } from 'react'
import { createPortal } from 'react-dom'

import { joinMembership, type JoinState } from '@/app/(frontend)/(site)/membership/actions'

export type TierId = 'student' | 'individual' | 'institutional'

const COUNTRIES_EN = ['India', 'UAE', 'Saudi Arabia', 'Oman', 'Qatar', 'Kuwait', 'Bahrain', 'International']
const COUNTRIES_AR = ['الهند', 'الإمارات', 'السعودية', 'عُمان', 'قطر', 'الكويت', 'البحرين', 'دولي']
const REGION_COUNTRY: Record<string, string> = { IN: 'India', AE: 'UAE', SA: 'Saudi Arabia', OM: 'Oman', QA: 'Qatar', KW: 'Kuwait', BH: 'Bahrain', INTL: 'International' }

const T = {
  en: {
    title: 'Register Interest', titleLive: 'Join and Pay', close: 'Close',
    intro: 'Pricing is coming soon. Leave your details and we’ll email you when membership opens.',
    introLive: 'Enter your details. You’ll continue to a secure payment page to complete your membership.',
    name: 'Full Name', namePh: 'e.g., Dr. / Mr. / Ms. Full Name', email: 'Professional Email', emailPh: 'e.g., name@hospital.org',
    country: 'Country', tier: 'Tier', cancel: 'Cancel', send: 'Register interest', sendLive: 'Continue to payment', sending: 'Sending…',
    thanks: 'Thanks, you’re on the list.', thanksBody: (t: string) => `We’ll email you as soon as ${t} membership opens.`, done: 'Done',
  },
  ar: {
    title: 'سجّل اهتمامك', titleLive: 'انضم وادفع', close: 'إغلاق',
    intro: 'الأسعار قريبًا. اترك بياناتك وسنراسلك عند فتح باب العضوية.',
    introLive: 'أدخل بياناتك، ثم ستنتقل إلى صفحة دفع آمنة لإكمال عضويتك.',
    name: 'الاسم الكامل', namePh: 'مثال: د. / السيد / السيدة الاسم الكامل', email: 'البريد الإلكتروني المهني', emailPh: 'name@hospital.org',
    country: 'البلد', tier: 'الفئة', cancel: 'إلغاء', send: 'سجّل اهتمامك', sendLive: 'المتابعة إلى الدفع', sending: 'جارٍ الإرسال…',
    thanks: 'شكرًا، تمت إضافتك إلى القائمة.', thanksBody: (t: string) => `سنراسلك فور فتح عضوية فئة «${t}».`, done: 'تم',
  },
}

const errIcon = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v6"></path><path d="M12 16.5h.01"></path></svg>
const chevron = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#134E5E" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>

export function MembershipModal({
  lang,
  live,
  tier,
  tierNames,
  region,
  defaults,
  onTier,
  onClose,
}: {
  lang: 'en' | 'ar'
  live: boolean
  tier: TierId
  tierNames: Record<TierId, string>
  region: string
  defaults: { name: string; email: string } | null
  onTier: (t: TierId) => void
  onClose: () => void
}) {
  const t = T[lang]
  const [state, formAction, pending] = useActionState<JoinState, FormData>(joinMembership, { ok: false, errors: {} })
  const dialog = useRef<HTMLDivElement>(null)
  const e = state.errors
  const sent = state.ok && !state.redirect

  useEffect(() => {
    if (state.redirect) window.location.href = state.redirect
  }, [state])

  // Esc closes, focus starts in the dialog and stays inside it.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    dialog.current?.querySelector<HTMLElement>('input, button')?.focus()
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose()
      if (ev.key !== 'Tab' || !dialog.current) return
      const items = Array.from(dialog.current.querySelectorAll<HTMLElement>('button, input, select, a[href]')).filter((x) => !x.hasAttribute('disabled'))
      if (!items.length) return
      const first = items[0]!, last = items[items.length - 1]!
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus() }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      prev?.focus()
    }
  }, [onClose])

  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const fd = new FormData(ev.currentTarget)
    fd.set('lang', lang)
    fd.set('region', region)
    fd.set('tier', tier)
    startTransition(() => formAction(fd))
  }
  const inp = (k: string) => (e[k] ? 'inp err' : 'inp')
  const msg = (k: string) => (e[k] ? <span className="emsg" id={`ri-${k}-err`}>{errIcon}{e[k]}</span> : null)
  const countries = lang === 'ar' ? COUNTRIES_AR : COUNTRIES_EN

  // Portalled to <body>: .pg is a CSS container, which would make it the containing block for a fixed overlay.
  // The wrapper is its own .pg so the design's styles and container queries (full-screen sheet on phones) still apply.
  return createPortal(
    <div className={lang === 'ar' ? 'pg ar-pg' : 'pg'} dir={lang === 'ar' ? 'rtl' : undefined} lang={lang} style={{ position: 'fixed', inset: '0', zIndex: 50, overflowY: 'auto', background: 'transparent', fontFamily: lang === 'ar' ? undefined : 'Inter, system-ui, sans-serif', color: '#17323A' }}>
    <div className="scrim" style={{ minHeight: '100%' }} onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}>
      <div ref={dialog} className="modal e2" role="dialog" aria-modal="true" aria-labelledby="ri-h">
        <div className="row between top g16" style={{ padding: lang === 'ar' ? '24px 28px 8px 24px' : '24px 24px 8px 28px' }}>
          <div className="stack g4"><span className="over">{tierNames[tier]}</span><h2 className="h3" id="ri-h" style={{ color: '#0B6B3A' }}>{live ? t.titleLive : t.title}</h2></div>
          <button className="ico ico-bare" aria-label={t.close} onClick={onClose}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>
        </div>
        {!sent && (
          <form noValidate onSubmit={onSubmit}>
            <p className="muted" style={{ padding: '0 28px' }}>{live ? t.introLive : t.intro}</p>
            <div className="stack g16" style={{ padding: '20px 28px' }}>
              {e.form && <div className="note note-err" role="alert"><span style={{ color: '#B3261E', flex: 'none', marginTop: '2px' }}>{errIcon}</span><span>{e.form}</span></div>}
              <div className="fld"><label className="lbl" htmlFor="ri-name">{t.name}</label><input className={inp('name')} id="ri-name" name="name" autoComplete="name" placeholder={t.namePh} defaultValue={defaults?.name} aria-invalid={!!e.name} aria-describedby={e.name ? 'ri-name-err' : undefined} />{msg('name')}</div>
              <div className="fld"><label className="lbl" htmlFor="ri-email">{t.email}</label><input className={inp('email')} id="ri-email" name="email" type="email" autoComplete="email" dir={lang === 'ar' ? 'ltr' : undefined} placeholder={t.emailPh} defaultValue={defaults?.email} aria-invalid={!!e.email} aria-describedby={e.email ? 'ri-email-err' : undefined} />{msg('email')}</div>
              <div className="grid c2" style={{ gap: '12px' }}>
                <div className="fld"><label className="lbl" htmlFor="ri-country">{t.country}</label><span className="sel"><select className={inp('country')} id="ri-country" name="country" defaultValue={REGION_COUNTRY[region] || 'India'}>{COUNTRIES_EN.map((c, i) => <option key={c} value={c}>{countries[i]}</option>)}</select>{chevron}</span>{msg('country')}</div>
                <div className="fld"><label className="lbl" htmlFor="ri-tier">{t.tier}</label><span className="sel"><select className={inp('tier')} id="ri-tier" value={tier} onChange={(ev) => onTier(ev.target.value as TierId)}>{(Object.keys(tierNames) as TierId[]).map((id) => <option key={id} value={id}>{tierNames[id]}</option>)}</select>{chevron}</span>{msg('tier')}</div>
              </div>
            </div>
            <div className="row g12" style={{ justifyContent: 'flex-end', padding: '16px 28px 24px', borderTop: '1px solid #D9D2C1' }}>
              <button type="button" className="btn btn-s" onClick={onClose}>{t.cancel}</button>
              <button type="submit" className="btn btn-p" disabled={pending || !!state.redirect}>{pending ? t.sending : live ? t.sendLive : t.send}</button>
            </div>
          </form>
        )}
        {sent && (
          <div className="stack g16" style={{ padding: '8px 28px 28px' }} role="status">
            <div className="note note-ok"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B6E3F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none', marginTop: '2px' }}><path d="m5 12 5 5 9-10"></path></svg><span><strong>{t.thanks}</strong>{' '}{t.thanksBody(tierNames[tier])}</span></div>
            <button className="btn btn-p self-start" onClick={onClose}>{t.done}</button>
          </div>
        )}
      </div>
    </div>
    </div>,
    document.body,
  )
}
