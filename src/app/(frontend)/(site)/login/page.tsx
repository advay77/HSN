// Ported from Login.dc.html (log in, sign up and the one-time-code step from Login-States.dc.html).
import { redirect } from 'next/navigation'
import React from 'react'

import '../../styles/pages/login.css'

import { googleConfigured } from '@/lib/auth/google'
import { safeNext } from '@/lib/auth/redirect'
import { getCurrentMember } from '@/lib/auth/session'
import { LoginForm } from './LoginForm'

export const metadata = { title: 'Log In' }

const ERRORS: Record<string, string> = {
  google: 'Google sign-in did not finish. Please try again, or use your email.',
  'google-cancelled': 'Google sign-in was cancelled.',
  'google-email': 'Your Google account email is not verified. Please use your email instead.',
  'google-not-configured': 'Google sign-in is not set up yet. Please use your email for now.',
  blocked: 'This account has been blocked. Contact HSN if you think this is a mistake.',
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams
  const next = safeNext(sp.next)
  const admin = sp.admin === '1'
  if (!admin && (await getCurrentMember())) redirect(next)

  return (
    <main className="sec" style={{ paddingTop: '56px' }}>
      <div className="wrap split" style={{ alignItems: 'stretch', maxWidth: '1200px' }}>
        {/* Left panel: photo of a green care team under a dark green wash, then the three reasons to log in (HSN request). */}
        <div className="login-art tabup">
          <div className="stack g16" style={{ position: 'relative' }}>
            <span className="over" style={{ color: '#BFE6C8', letterSpacing: '.18em' }}>Course Enrollment</span>
            <h2 className="h1" style={{ color: '#FFFFFF' }}>Your Healthcare Sustainability Learning Journey Starts Here.</h2>
          </div>
          <ul className="login-perks">
            <li><span className="login-tick" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10"></path></svg></span><span><b>Instant, Passwordless Login</b><span>Get in with a secure one-time email code</span></span></li>
            <li><span className="login-tick" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10"></path></svg></span><span><b>Seamless Progress Sync</b><span>Switch between devices effortlessly</span></span></li>
            <li><span className="login-tick" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10"></path></svg></span><span><b>Continue your courses where you left off</b></span></li>
          </ul>
        </div>
        <LoginForm
          next={next}
          initialMode={sp.mode === 'signup' ? 'signup' : 'login'}
          googleEnabled={googleConfigured()}
          initialAdmin={admin}
          initialError={sp.error ? ERRORS[sp.error] ?? ERRORS.google : undefined}
        />
      </div>
    </main>
  )
}
