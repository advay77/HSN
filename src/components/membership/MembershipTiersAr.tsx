'use client'

// Body of MembershipAr.dc.html: right-to-left region selector and tier cards, with the shared membership modal.
import Link from 'next/link'
import React, { useCallback, useState } from 'react'

import { MembershipModal, type TierId } from './MembershipModal'

const REGIONS = [
  { id: 'IN', label: 'الهند (₹ INR)', cur: '₹ INR' }, { id: 'AE', label: 'الإمارات (AED)', cur: 'AED' }, { id: 'SA', label: 'السعودية (SAR)', cur: 'SAR' }, { id: 'OM', label: 'عُمان (OMR)', cur: 'OMR' },
  { id: 'QA', label: 'قطر (QAR)', cur: 'QAR' }, { id: 'KW', label: 'الكويت (KWD)', cur: 'KWD' }, { id: 'BH', label: 'البحرين (BHD)', cur: 'BHD' }, { id: 'INTL', label: 'دولي (US$ USD)', cur: 'US$ USD' },
]
const TIERS: { id: TierId; name: string; blurb: string; features: string[] }[] = [
  { id: 'student', name: 'طالب', blurb: 'لطلاب الرعاية الصحية والهندسة والاستدامة.', features: ['الوصول إلى مجتمع واتساب / لينكدإن', 'دورات تمهيدية قصيرة', 'دراسات الحالة المنشورة', 'شارة الطالب'] },
  { id: 'individual', name: 'مهني فردي', blurb: 'للأطباء ومديري الجودة والمهندسين والإداريين.', features: ['كل مزايا فئة الطالب', 'مكتبة الدورات الكاملة', 'تقديم دراسات الحالة', 'شهادة HSN موثّقة'] },
  { id: 'institutional', name: 'مؤسسي', blurb: 'للمستشفيات والأنظمة الصحية التي تدرّب فرقها.', features: ['حتى 20 حسابًا للموظفين', 'اعتراف مؤسسي على الموقع', 'أدوات التدقيق الأخضر', 'تقارير المقارنة المعيارية'] },
]
const TIER_NAMES = Object.fromEntries(TIERS.map((t) => [t.id, t.name])) as Record<TierId, string>

export function MembershipTiersAr({
  live,
  prices,
  defaults,
}: {
  live: boolean
  prices: Partial<Record<TierId, Record<string, string>>>
  defaults: { name: string; email: string } | null
}) {
  const [region, setRegion] = useState('AE')
  const [modalTier, setModalTier] = useState<TierId | null>(null)
  const close = useCallback(() => setModalTier(null), [])
  const currency = (REGIONS.find((r) => r.id === region) || REGIONS[1]!).cur

  return (
    <>
      <section className="sec" style={{ paddingTop: '64px', paddingBottom: '40px' }}>
        <div className="wrap stack g20" style={{ maxWidth: '1440px' }}>
          <h1 className="display">العضوية</h1>
          <p className="lead" style={{ maxWidth: '860px' }}>انضم إلى شبكة متنامية من مهنيي ومؤسسات الرعاية الصحية الذين يقودون الرعاية المستدامة في الهند ودول الخليج.</p>
        </div>
      </section>
      <section className="sec" style={{ paddingTop: '0' }}>
        <div className="wrap stack g32">
          <div className="card pad row between g16" style={{ paddingBlock: '20px' }}>
            <div className="stack"><label className="lbl" htmlFor="rg-ar">المنطقة والعملة</label><span className="small muted">ستظهر الأسعار بعملتك المحلية.</span></div>
            <span className="sel" style={{ flex: '0 1 340px', minWidth: '240px' }}>
              <select className="inp" id="rg-ar" style={{ fontWeight: '600' }} value={region} onChange={(e) => setRegion(e.target.value)}>
                {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#134E5E" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
            </span>
          </div>
          <div className="grid c3 t1">
            {TIERS.map((t, i) => {
              const price = prices[t.id]?.[region]
              return (
                <article key={t.id} className="card stack" style={i === 1 ? { border: '2px solid #0B6B3A', boxShadow: '0 8px 24px rgba(19,78,94,.12)' } : undefined}>
                  <div className="pad stack g16" style={{ flex: '1' }}>
                    <h2 className="h3">{t.name}</h2>
                    <p className="muted">{t.blurb}</p>
                    <div className="stack g4" style={{ padding: '16px', borderRadius: '12px', background: '#F5F1E6' }} aria-live="polite">
                      <span className="small strong muted" dir="ltr" style={{ textAlign: 'right' }}>{currency}</span>
                      {live && price ? <span className="row g8 end"><span className="metric-l">{price}</span><span className="muted strong" style={{ paddingBottom: '6px' }}>/ سنويًا</span></span> : <span className="h4">الأسعار قريبًا</span>}
                    </div>
                    <ul className="ticks">
                      {t.features.map((f) => <li key={f}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B6B3A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg><span>{f}</span></li>)}
                    </ul>
                  </div>
                  <div className="pad" style={{ paddingTop: '0' }}><button className={i === 1 ? 'btn btn-p btn-block' : 'btn btn-s btn-block'} onClick={() => setModalTier(t.id)} disabled={live && !price}>{live ? 'انضم وادفع' : 'سجّل اهتمامك'}</button></div>
                </article>
              )
            })}
          </div>
          {!live && <p className="small muted">الدفع الإلكتروني غير متاح حاليًا. تسجيل الاهتمام لا يُلزمك بشيء، وسنراسلك عند فتح باب العضوية.</p>}
        </div>
      </section>
      {modalTier && (
        <MembershipModal lang="ar" live={live} tier={modalTier} tierNames={TIER_NAMES} region={region} defaults={defaults} onTier={setModalTier} onClose={close} />
      )}
    </>
  )
}
