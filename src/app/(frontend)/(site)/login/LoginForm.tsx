'use client'

import React, { useEffect, useRef, useState, useTransition } from 'react'

import { adminLoginAction, sendCodeAction, verifyCodeAction } from './actions'
import { Turnstile, turnstileOn } from '@/components/site/Turnstile'

type Mode = 'login' | 'signup'

const ErrorMsg = ({ children }: { children: React.ReactNode }) => (
  <span className="emsg" role="alert">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7.5v5.5M12 16.5v.01"></path></svg>
    <span>{children}</span>
  </span>
)

export function LoginForm({ next, initialMode, googleEnabled, initialError, initialAdmin = false }: { next: string; initialMode: Mode; googleEnabled: boolean; initialError?: string; initialAdmin?: boolean }) {
  // Admin mode ("HSN Admin Log In" in the design): admin email + password, opens the admin panel.
  const [admin, setAdmin] = useState(initialAdmin)
  const [mode, setMode] = useState<Mode>(initialMode)
  const [tsToken, setTsToken] = useState('')
  const [tsReset, setTsReset] = useState(0)
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [joinNetwork, setJoinNetwork] = useState(false)
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [error, setError] = useState<string | undefined>(initialError)
  const [resendIn, setResendIn] = useState(0)
  const [pending, startTransition] = useTransition()
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const isSignup = mode === 'signup'

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn(resendIn - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  useEffect(() => {
    if (step === 'code') inputs.current[0]?.focus()
  }, [step])

  const switchMode = (m: Mode) => {
    setMode(m)
    if (m === 'signup') setAdmin(false)
    setStep('email')
    setError(undefined)
  }

  const sendCode = (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(undefined)
    startTransition(async () => {
      if (admin) {
        const a = await adminLoginAction({ email, password, next, turnstile: tsToken })
        setTsReset((n) => n + 1)
        if (a.ok) window.location.assign(a.next)
        else setError(a.error)
        return
      }
      const r = await sendCodeAction({ email, mode, name, joinNetwork, turnstile: tsToken })
      setTsReset((n) => n + 1)
      if (r.ok) {
        setDigits(['', '', '', '', '', ''])
        setStep('code')
        setResendIn(r.resendIn)
      } else {
        setError(r.error)
        if (r.resendIn) setResendIn(r.resendIn)
      }
    })
  }

  const verify = (code: string) => {
    setError(undefined)
    startTransition(async () => {
      const r = await verifyCodeAction({ email, code, next })
      if (r.ok) window.location.assign(r.next)
      else setError(r.error)
    })
  }

  const setDigit = (i: number, raw: string) => {
    const chars = raw.replace(/\D/g, '')
    if (chars.length > 1) {
      // Pasted or autofilled code: spread it over the boxes.
      const nextDigits = [...digits]
      for (let k = 0; k < chars.length && i + k < 6; k++) nextDigits[i + k] = chars[k]!
      setDigits(nextDigits)
      inputs.current[Math.min(i + chars.length, 5)]?.focus()
      if (nextDigits.every(Boolean)) verify(nextDigits.join(''))
      return
    }
    const nextDigits = [...digits]
    nextDigits[i] = chars
    setDigits(nextDigits)
    if (chars && i < 5) inputs.current[i + 1]?.focus()
    if (chars && nextDigits.every(Boolean)) verify(nextDigits.join(''))
  }

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus()
    if (e.key === 'ArrowLeft' && i > 0) inputs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < 5) inputs.current[i + 1]?.focus()
  }

  const onPaste = (i: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    setDigit(i, e.clipboardData.getData('text'))
  }

  const google = () => {
    if (!googleEnabled) {
      setError('Google sign-in is not set up yet. Please use your email for now.')
      return
    }
    window.location.assign(`/api/auth/google?next=${encodeURIComponent(next)}`)
  }

  const mm = Math.floor(resendIn / 60)
  const ss = String(resendIn % 60).padStart(2, '0')

  return (
    <div className="card pad-l stack g24 e1" style={{ maxWidth: '520px', width: '100%', justifySelf: 'center' }}>
      <div className="seg" role="tablist" aria-label="Log in or sign up" style={{ width: '100%' }}>
        <button role="tab" className={isSignup ? '' : 'on'} aria-selected={!isSignup} onClick={() => switchMode('login')} style={{ flex: 1 }}>Log in</button>
        <button role="tab" className={isSignup ? 'on' : ''} aria-selected={isSignup} onClick={() => switchMode('signup')} style={{ flex: 1 }}>Sign up</button>
      </div>
      {step === 'email' && (
        <form className="stack g20" onSubmit={sendCode} noValidate>
          <div className="stack g8">
            <h1 className="h2">{admin ? 'HSN Admin Log In' : isSignup ? 'Join HSN' : 'Welcome Back'}</h1>
            <p className="muted">{admin ? 'For the HSN founder and team. Use your admin email and password.' : isSignup ? 'Create your free account to register for courses and join the community.' : 'Log in to your member area.'}</p>
          </div>
          {!admin && googleEnabled && (<>
          <button className="btn btn-g btn-lg btn-block" type="button" onClick={google}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"></path><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"></path><path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14z"></path><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z"></path></svg>{' '}Continue with Google</button>
          <div className="row g12 nowrap small muted" aria-hidden="true"><span className="grow divider"></span>or use your email<span className="grow divider"></span></div>
          </>)}
          {isSignup && (
            <div className="fld"><label className="lbl" htmlFor="l-name">Full Name</label><input className="inp" id="l-name" autoComplete="name" placeholder="e.g., Dr. / Mr. / Ms. Full Name" value={name} onChange={(e) => setName(e.target.value)} /></div>
          )}
          <div className="fld"><label className="lbl" htmlFor="l-email">{admin ? 'Admin Email' : 'Professional Email'}</label><input className="inp" id="l-email" type="email" autoComplete="email" placeholder="e.g., name@hospital.org" value={email} onChange={(e) => setEmail(e.target.value)} />{!admin && <span className="hint">We’ll email you a one-time code. No password needed.</span>}</div>
          {admin && (
            <div className="fld"><label className="lbl" htmlFor="l-pass">Password</label><input className="inp" id="l-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          )}
          {isSignup && (
            <label className="chk"><input type="checkbox" checked={joinNetwork} onChange={(e) => setJoinNetwork(e.target.checked)} /><span>Yes, add me to the HSN WhatsApp/LinkedIn Network</span></label>
          )}
          <Turnstile onToken={setTsToken} resetKey={tsReset} />
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <button className="btn btn-p btn-lg btn-block" type="submit" disabled={pending || (turnstileOn && !tsToken)}>{admin ? 'Log in to admin panel' : 'Send one-time code'}</button>
          <p className="small muted">By continuing you agree to our{' '}<a href="/privacy">Privacy Policy</a>.</p>
          <div className="row g8" style={{ paddingTop: '12px', borderTop: '1px solid #D9D2C1' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#134E5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>
            <button type="button" className="btn btn-t btn-sm" style={{ padding: '0 4px' }} onClick={() => { setAdmin(!admin); setMode('login'); setStep('email'); setError(undefined) }}>{admin ? 'Back to member log in' : 'HSN team? Log in to the admin panel'}</button>
          </div>
        </form>
      )}
      {step === 'code' && (
        <form
          className="stack g20"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            verify(digits.join(''))
          }}
        >
          <span className="ic ic-a"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg></span>
          <div className="stack g8">
            <h1 className="h2">Check Your Email</h1>
            <p className="muted">We sent a 6-digit code to{' '}<strong style={{ color: '#17323A' }}>{email.trim()}</strong>. It expires in 10 minutes.</p>
          </div>
          <fieldset className="stack g8" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="lbl" style={{ padding: 0, marginBottom: '6px' }}>One-time code</legend>
            <div className="code">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el
                  }}
                  aria-label={`Digit ${i + 1}`}
                  inputMode="numeric"
                  maxLength={i === 0 ? 6 : 1}
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  onPaste={(e) => onPaste(i, e)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>
          </fieldset>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <button className="btn btn-p btn-lg btn-block" type="submit" disabled={pending} style={{ color: '#FFFFFF', textDecoration: 'none' }}>Verify and continue</button>
          <div className="row between g8 small">
            {resendIn > 0 ? (
              <span className="muted">Resend code in {mm}:{ss}</span>
            ) : (
              <button className="btn btn-t btn-sm" type="button" style={{ padding: '0 4px' }} disabled={pending} onClick={() => sendCode()}>Resend code</button>
            )}
            <button
              className="btn btn-t btn-sm"
              type="button"
              style={{ padding: '0 4px' }}
              onClick={() => {
                setStep('email')
                setError(undefined)
              }}
            >
              Use a different email
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
