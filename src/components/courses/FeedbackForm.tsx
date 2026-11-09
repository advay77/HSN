'use client'

import React, { useState, useTransition } from 'react'

import { submitCourseFeedback } from '@/app/(frontend)/(site)/courses/[slug]/feedback/actions'
import { CONTENT_RATINGS, PLATFORM_RATINGS, RATINGS, RECOMMEND, SATISFACTION, type RatingKey } from '@/lib/courses/feedback'

function Scale({ name, label }: { name: string; label: string }) {
  return (
    <fieldset className="fb-q">
      <legend>{label}</legend>
      <div className="fb-scale" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n}>
            <input type="radio" name={name} value={n} required />
            <span>{n}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function Choice({ name, label, options }: { name: string; label: string; options: readonly { value: string; label: string }[] }) {
  return (
    <fieldset className="fb-q">
      <legend>{label}</legend>
      <div className="fb-choice">
        {options.map((option) => (
          <label key={option.value}>
            <input type="radio" name={name} value={option.value} required />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function FeedbackForm({
  courseSlug,
  courseTitle,
  defaults,
}: {
  courseSlug: string
  courseTitle: string
  defaults: { name: string; completionDate: string }
}) {
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [pending, start] = useTransition()

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const ratings = Object.fromEntries(RATINGS.map((item) => [item.key, Number(f.get(item.key))])) as Record<RatingKey, number>
    start(async () => {
      const result = await submitCourseFeedback({
        courseSlug,
        delegateName: String(f.get('delegateName') || ''),
        completionDate: String(f.get('completionDate') || ''),
        overallSatisfaction: String(f.get('overallSatisfaction') || ''),
        recommend: String(f.get('recommend') || ''),
        ratings,
        takeaway: String(f.get('takeaway') || ''),
        application: String(f.get('application') || ''),
        futureTopics: String(f.get('futureTopics') || ''),
        comments: String(f.get('comments') || ''),
        sharePublicly: f.get('sharePublicly') === 'on',
      })
      if (result.ok) {
        setDone(true)
        window.scrollTo({ top: 0 })
      } else setError(result.error)
    })
  }

  if (done) {
    return (
      <div className="card pad-l stack g24" role="status">
        <span className="ic" style={{ width: '72px', height: '72px', borderRadius: '999px', background: '#E3F1E4', color: '#1B6E3F' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg>
        </span>
        <div className="stack g8">
          <h1 className="h2">Thank you for your feedback</h1>
          <p className="muted">Your response for {courseTitle} has been sent to the HSN team.</p>
        </div>
        <div className="row g12 mstack">
          <a className="btn btn-p" href={`/courses/${courseSlug}/certificate`}>View certificate</a>
          <a className="btn btn-s" href="/my">Back to My HSN</a>
        </div>
      </div>
    )
  }

  return (
    <div className="card pad-l stack g24">
      <div className="stack g8">
        <span className="over">After you finish</span>
        <h1 className="h1">Course Completion Delegate Feedback Form</h1>
        <p className="muted">Tell us how {courseTitle} worked for you. Ratings use 1 for Strongly Disagree and 5 for Strongly Agree.</p>
      </div>
      {error && (
        <div className="note note-err" role="alert">
          <strong style={{ color: '#B3261E' }}>{error}</strong>
        </div>
      )}
      <form className="stack g24" onSubmit={onSubmit}>
        <div className="grid c2" style={{ gap: '20px' }}>
          <div className="fld">
            <label className="lbl" htmlFor="fb-name">Delegate name</label>
            <input className="inp" id="fb-name" name="delegateName" autoComplete="name" defaultValue={defaults.name} required />
          </div>
          <div className="fld">
            <label className="lbl" htmlFor="fb-date">Completion date</label>
            <input className="inp" id="fb-date" name="completionDate" type="date" defaultValue={defaults.completionDate} required />
          </div>
        </div>
        <div className="fld">
          <span className="lbl">Course title</span>
          <span className="strong">{courseTitle}</span>
        </div>

        <section className="fb-sec">
          <h2 className="h4">1. Overall experience</h2>
          <p className="muted">Please rate your overall experience with this course.</p>
          <Choice name="overallSatisfaction" label="Overall satisfaction" options={SATISFACTION} />
          <Choice name="recommend" label="Would you recommend this course to a colleague or healthcare peer?" options={RECOMMEND} />
        </section>

        <section className="fb-sec">
          <h2 className="h4">2. Course content and design</h2>
          <p className="muted">1 = Strongly Disagree, 5 = Strongly Agree.</p>
          {CONTENT_RATINGS.map((item) => <Scale key={item.key} name={item.key} label={item.label} />)}
        </section>

        <section className="fb-sec">
          <h2 className="h4">3. Online platform and delivery</h2>
          <p className="muted">Help us evaluate the user interface and micro-learning experience.</p>
          {PLATFORM_RATINGS.map((item) => <Scale key={item.key} name={item.key} label={item.label} />)}
        </section>

        <section className="fb-sec stack g16">
          <h2 className="h4">4. Impact and practical application</h2>
          <div className="fld">
            <label className="lbl" htmlFor="fb-take">What was the most valuable takeaway or topic from this course?</label>
            <textarea className="inp" id="fb-take" name="takeaway" rows={3} />
          </div>
          <div className="fld">
            <label className="lbl" htmlFor="fb-apply">How do you plan to apply what you learned in your daily work or facility?</label>
            <textarea className="inp" id="fb-apply" name="application" rows={3} />
          </div>
          <div className="fld">
            <label className="lbl" htmlFor="fb-next">What additional topics or advanced modules would you like to see in the future?</label>
            <textarea className="inp" id="fb-next" name="futureTopics" rows={3} />
          </div>
        </section>

        <section className="fb-sec">
          <h2 className="h4">5. Additional comments</h2>
          <div className="fld">
            <label className="lbl" htmlFor="fb-comments">Please share any suggestions or general feedback to help us improve future courses.</label>
            <textarea className="inp" id="fb-comments" name="comments" rows={4} />
          </div>
        </section>

        <div className="row g16 mstack">
          <label className="chk"><input type="checkbox" name="sharePublicly" /><span>HSN may show my takeaway or comments, with my first name, on the course page.</span></label>
          <button type="submit" className="btn btn-p btn-lg" disabled={pending}>{pending ? 'Sending…' : 'Submit feedback'}</button>
          <span className="small muted">By submitting you agree to our <a href="/privacy">Privacy Policy</a>.</span>
        </div>
      </form>
    </div>
  )
}
