import React from 'react'

export type CourseAccess = 'open' | 'paid'

function Mark({ children, size = 14 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

export function OpenAccessIcon({ size = 14 }: { size?: number }) {
  return (
    <Mark size={size}>
      <rect x="4" y="11" width="16" height="10" rx="2"></rect>
      <path d="M8 11V8a4 4 0 0 1 7.6-1.8"></path>
    </Mark>
  )
}

export function PaidAccessIcon({ size = 14 }: { size?: number }) {
  return (
    <Mark size={size}>
      <rect x="4" y="11" width="16" height="10" rx="2"></rect>
      <path d="M8 11V8a4 4 0 0 1 8 0v3"></path>
    </Mark>
  )
}

export function RegistrationIcon({ size = 14 }: { size?: number }) {
  return (
    <Mark size={size}>
      <path d="M8 4h8a2 2 0 0 1 2 2v14l-2-1.2L14 20l-2-1.2L10 20l-2-1.2L6 20V6a2 2 0 0 1 2-2z"></path>
      <path d="M9 9h6M9 13h6"></path>
    </Mark>
  )
}

/** Badges visitors see above a course title. Access is always first. */
export function CourseTagRow({
  access,
  registration,
  children,
}: {
  access: CourseAccess
  registration: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="row g8">
      {access === 'paid' ? (
        <span className="bdg b-ex"><PaidAccessIcon />Paid access</span>
      ) : (
        <span className="bdg b-ok"><OpenAccessIcon />Open access</span>
      )}
      {registration && (
        <span className="bdg b-info"><RegistrationIcon />Registration</span>
      )}
      {children}
    </div>
  )
}
