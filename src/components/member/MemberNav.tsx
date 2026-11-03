// Member area side navigation (Dashboard.dc.html / Profile.dc.html).
import Link from 'next/link'
import React from 'react'

export function MemberNav({ current }: { current: 'dashboard' | 'profile' }) {
  const onDash = current === 'dashboard'
  // On the dashboard the section links jump within the page; elsewhere they open the dashboard at that section.
  const base = onDash ? '' : '/my'
  return (
    <nav className="mnav" aria-label="Member area">
      <Link className={onDash ? 'cur' : undefined} href="/my" aria-current={onDash ? 'page' : undefined}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="9" rx="1.5"></rect><rect x="14" y="3" width="7" height="5" rx="1.5"></rect><rect x="14" y="12" width="7" height="9" rx="1.5"></rect><rect x="3" y="16" width="7" height="5" rx="1.5"></rect></svg>Dashboard</Link>
      <a href={`${base}#my-courses`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"></path><path d="M4 19a2 2 0 0 1 2-2h13"></path></svg>My courses</a>
      <a href={`${base}#registrations`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"></rect><path d="M8 2v4M16 2v4M3 10h18"></path></svg>Registrations</a>
      <a href={`${base}#cases`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><path d="M14 3v6h6"></path></svg>My case studies</a>
      <Link className={!onDash ? 'cur' : undefined} href="/my/profile" aria-current={!onDash ? 'page' : undefined}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></svg>My profile</Link>
      <a href="/api/auth/logout"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><path d="m16 17 5-5-5-5"></path><path d="M21 12H9"></path></svg>Log out</a>
    </nav>
  )
}

export const TIER_LABEL: Record<string, string> = {
  student: 'Student',
  individual: 'Individual Professional',
  institutional: 'Institutional',
}

// Feature line under the tier on the Profile page (from the Membership page tiers).
export const TIER_FEATURES: Record<string, string> = {
  student: 'Community access · introductory micro-courses · published case studies',
  individual: 'Full course library · case study submissions · verified HSN certificate',
  institutional: 'Up to 20 staff accounts · institutional recognition · green audit toolkits',
}

export const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
