'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

// Design nav plus "Library", which the client needs to upload resources (not in the original boards).
const NAV: [string, string][] = [
  ['/admin', 'Overview'],
  ['/admin/members', 'Members'],
  ['/admin/courses', 'Courses'],
  ['/admin/quizzes', 'Quiz results'],
  ['/admin/certificates', 'Certificates'],
  ['/admin/registrations', 'Course registrations'],
  ['/admin/feedback', 'Feedback'],
  ['/admin/interest', 'Membership interest'],
  ['/admin/case-studies', 'Case studies'],
  ['/admin/library', 'Library'],
]

export function AdminNav({ pendingCases }: { pendingCases: number }) {
  const pathname = usePathname() || '/admin'
  const isCur = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(href + '/'))
  return (
    <nav className="anav" aria-label="Admin sections">
      {NAV.map(([href, label]) => (
        <Link key={href} className={isCur(href) ? 'cur' : ''} href={href} aria-current={isCur(href) ? 'page' : undefined}>
          {label}
          {href === '/admin/case-studies' && pendingCases > 0 && <span className="cnt">{pendingCases}</span>}
        </Link>
      ))}
    </nav>
  )
}
