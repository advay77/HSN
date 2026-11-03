'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

// Filters on the admin list pages live in the URL (?q=&tier=…), so the server renders the filtered list and
// Export CSV downloads exactly what is shown.
export function useQueryState() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === '' || v === 'all') next.delete(k)
      else next.set(k, v)
    }
    if (!('page' in patch)) next.delete('page')
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }
  return { params, set }
}

const Chevron = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#134E5E" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" style={{ top: '13px' }}><path d="m6 9 6 6 6-6"></path></svg>
)

/** A filter <select> as in the boards (label is either visually hidden or a small label above). */
export function FilterSelect({
  id,
  name,
  label,
  labelClass,
  options,
  allLabel,
  width,
  wrapField = false,
}: {
  id: string
  name: string
  label: string
  labelClass: string
  options: { value: string; label: string }[]
  allLabel: string
  width: string
  wrapField?: boolean
}) {
  const { params, set } = useQueryState()
  const select = (
    <select className="inp" id={id} style={{ minHeight: '44px', width }} value={params.get(name) ?? 'all'} onChange={(e) => set({ [name]: e.target.value })}>
      <option value="all">{allLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
  if (wrapField) {
    return (
      <div className="fld"><label className={labelClass} htmlFor={id}>{label}</label><span className="sel">{select}<Chevron /></span></div>
    )
  }
  return (
    <span className="sel"><label className={labelClass} htmlFor={id}>{label}</label>{select}<Chevron /></span>
  )
}

/** The members search box: filters as you type (debounced). */
export function SearchBox({ id, placeholder }: { id: string; placeholder: string }) {
  const { params, set } = useQueryState()
  const [q, setQ] = useState(params.get('q') ?? '')
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const t = setTimeout(() => set({ q: q.trim() || null }), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])
  return (
    <input className="inp" id={id} type="search" placeholder={placeholder} style={{ paddingInlineStart: '44px' }} value={q} onChange={(e) => setQ(e.target.value)} />
  )
}

/** "Export CSV" button: downloads the current filter from `href` + the page's query string. */
export function ExportButton({ href }: { href: string }) {
  const params = useSearchParams()
  return (
    <button
      className="btn btn-s btn-sm"
      onClick={() => {
        const qs = params.toString()
        window.location.assign(qs ? `${href}?${qs}` : href)
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11"></path><path d="m7 10 5 5 5-5"></path><path d="M5 20h14"></path></svg>Export CSV
    </button>
  )
}

export function ClearFiltersButton() {
  const router = useRouter()
  const pathname = usePathname()
  return (
    <button className="btn btn-s" onClick={() => router.replace(pathname, { scroll: false })}>Clear filters</button>
  )
}
