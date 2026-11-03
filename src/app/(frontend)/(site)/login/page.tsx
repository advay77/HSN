// Ported from Login.dc.html (log in, sign up and the one-time-code step from Login-States.dc.html).
import { redirect } from 'next/navigation'
import React from 'react'

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
        <div className="bg-green tabup stack g24" style={{ borderRadius: '24px', padding: '48px', position: 'relative', overflow: 'hidden', justifyContent: 'space-between' }}>
          <svg width="360" height="360" viewBox="0 0 24 24" fill="none" stroke="#4FAE4E" strokeWidth=".5" strokeLinecap="round" aria-hidden="true" style={{ position: 'absolute', insetInlineEnd: '-60px', bottom: '-60px', opacity: 0.6 }}><path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15"></path><path d="M5 19 13 11"></path></svg>
          <div className="stack g16" style={{ position: 'relative' }}>
            <span className="over">Member area</span>
            <h2 className="h1">Collaborating for a Green and Healthy Future.</h2>
          </div>
          <ul className="ticks" style={{ position: 'relative', color: '#E3F1E4' }}>
            <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg>Continue your courses where you left off</li>
            <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg>Track your registrations and case study submissions</li>
            <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg>Your accessibility settings follow you to any device</li>
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
