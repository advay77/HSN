import React from 'react'

// Loading placeholders shown while a page's data arrives (Next.js loading.tsx files use these).
// They copy the rough shape of the page so nothing jumps when the real content appears.

const Sk = ({ w, h, className = '', style }: { w?: number | string; h?: number | string; className?: string; style?: React.CSSProperties }) => (
  <span className={`sk ${className}`} style={{ width: w, height: h, ...style }} />
)

const Lines = ({ n, last = '60%' }: { n: number; last?: string }) => (
  <div className="stack g8">
    {Array.from({ length: n }, (_, i) => (
      <Sk key={i} className="sk-line" w={i === n - 1 ? last : '100%'} />
    ))}
  </div>
)

const Card = () => (
  <div className="sk-card">
    <Sk className="sk-img" />
    <Sk className="sk-line" w="40%" />
    <Sk className="sk-title" w="85%" h={22} />
    <Lines n={3} />
  </div>
)

/** Public pages: hero block, then a grid of cards. */
export function SitePageSkeleton() {
  return (
    <main className="sk-page" aria-busy="true" aria-label="Loading page">
      <section className="sec">
        <div className="wrap grid c2 t1 g32" style={{ alignItems: 'center' }}>
          <div className="stack g16">
            <Sk className="sk-line" w={120} />
            <Sk className="sk-title" w="90%" h={44} />
            <Sk className="sk-title" w="70%" h={44} />
            <Lines n={3} last="75%" />
            <div className="row g12" style={{ flexWrap: 'wrap' }}><Sk className="sk-btn" /><Sk className="sk-btn" w={140} /></div>
          </div>
          <Sk className="sk-img" />
        </div>
      </section>
      <section className="sec">
        <div className="wrap stack g24">
          <Sk className="sk-title" w={260} />
          <div className="grid c3 t1 g24"><Card /><Card /><Card /></div>
        </div>
      </section>
      <span className="sr">Loading…</span>
    </main>
  )
}

/** Course page: title, facts row, and the modules list. */
export function CourseSkeleton() {
  return (
    <main className="sk-page" aria-busy="true" aria-label="Loading course">
      <section className="sec">
        <div className="wrap stack g24">
          <div className="grid c2 t1 g32" style={{ alignItems: 'center' }}>
            <div className="stack g16">
              <div className="row g8"><Sk w={80} h={26} style={{ borderRadius: 13 }} /><Sk w={90} h={26} style={{ borderRadius: 13 }} /></div>
              <Sk className="sk-title" w="95%" h={44} />
              <Sk className="sk-title" w="60%" h={44} />
              <Lines n={3} />
              <Sk className="sk-btn" />
            </div>
            <Sk className="sk-img" />
          </div>
          <div className="grid c3 t1 g16">{[0, 1, 2].map((i) => <div key={i} className="sk-card"><Sk className="sk-line" w="50%" /><Sk className="sk-line" w="80%" /></div>)}</div>
        </div>
      </section>
      <section className="sec">
        <div className="wrap stack g12">
          <Sk className="sk-title" w={240} />
          {[0, 1, 2, 3].map((i) => <div key={i} className="sk-card" style={{ flexDirection: 'row', alignItems: 'center' }}><Sk className="sk-circle" w={36} h={36} /><div className="stack g8" style={{ flex: 1 }}><Sk className="sk-line" w="55%" /><Sk className="sk-line" w="25%" /></div></div>)}
        </div>
      </section>
      <span className="sr">Loading…</span>
    </main>
  )
}

/** Course player: top bar, outline and the lesson card. */
export function PlayerSkeleton() {
  return (
    <main className="sk-page" aria-busy="true" aria-label="Loading lesson" style={{ padding: '16px', maxWidth: 1200, margin: '0 auto' }}>
      <div className="row between g12" style={{ marginBottom: 24 }}><Sk w={220} h={20} /><div className="row g8"><Sk w={110} h={44} style={{ borderRadius: 12 }} /><Sk className="sk-circle" w={44} h={44} /></div></div>
      <div className="stack g12" style={{ maxWidth: 820, margin: '0 auto' }}>
        <Sk className="sk-line" w={180} />
        <Sk className="sk-title" w="70%" />
        <div className="sk-card" style={{ minHeight: 360 }}>
          <Sk className="sk-line" w={220} />
          <Sk className="sk-title" w="60%" />
          <Lines n={5} />
        </div>
        <div className="row between"><Sk className="sk-btn" w={130} /><Sk className="sk-btn" w={110} /></div>
      </div>
      <span className="sr">Loading…</span>
    </main>
  )
}

/** Admin pages: heading, stat tiles and a table. */
export function AdminSkeleton() {
  return (
    <main className="sk-page" aria-busy="true" aria-label="Loading" style={{ padding: '28px' }}>
      <div className="stack g24">
        <div className="row between g12"><Sk className="sk-title" w={240} /><Sk className="sk-btn" w={150} /></div>
        <div className="grid c4 t2 g16">{[0, 1, 2, 3].map((i) => <div key={i} className="sk-card"><Sk className="sk-line" w="50%" /><Sk className="sk-title" w="40%" /></div>)}</div>
        <div className="sk-card">
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="row g16" style={{ alignItems: 'center' }}><Sk className="sk-circle" w={32} h={32} /><Sk className="sk-line" w="30%" /><Sk className="sk-line" w="20%" style={{ marginLeft: 'auto' }} /></div>)}
        </div>
      </div>
      <span className="sr">Loading…</span>
    </main>
  )
}
