'use client'

import React from 'react'

import type { CourseFeedbackSummary } from '@/lib/admin/courseFeedback'

// "Feedback" tab of the course editor: the built-in Course Completion Delegate Feedback Form (HSN's Word
// template) and a summary of this course's answers.

const FORM: { title: string; intro?: string; items: string[] }[] = [
  { title: '1. Overall Experience', items: ['Overall satisfaction: Excellent · Good · Average · Below Average · Poor', 'Would you recommend this course to a colleague or healthcare peer? Yes, definitely · Maybe · No'] },
  {
    title: '2. Course Content & Design',
    intro: 'Rated 1 to 5 (1 = Strongly Disagree, 5 = Strongly Agree)',
    items: ['The learning objectives were clear and met.', 'The course content was relevant to my professional role.', 'The topics were structured logically and easy to follow.', 'The course length and pace were appropriate.', 'Practical examples/case studies were helpful.'],
  },
  { title: '3. Online Platform & Delivery', intro: 'Rated 1 to 5', items: ['The online platform was user-friendly and easy to navigate.', 'Video quality, audio, and visual materials were clear.', 'Quizzes/knowledge checks reinforced my learning.'] },
  { title: '4. Impact & Practical Application', items: ['What was the most valuable takeaway or topic from this course?', 'How do you plan to apply what you learned in your daily work/facility?', 'What additional topics or advanced modules would you like to see in the future?'] },
  { title: '5. Additional Comments', items: ['Please share any suggestions or general feedback to help us improve future courses.'] },
]

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0)

function Bar({ label, value, max, text, good }: { label: string; value: number; max: number; text: string; good?: boolean }) {
  return (
    <div className="stack g4">
      <span className="row between g12 small"><span>{label}</span><span className="strong">{text}</span></span>
      <span aria-hidden="true" style={{ display: 'block', height: '10px', borderRadius: '5px', background: '#EDE7D8', overflow: 'hidden' }}>
        <span style={{ display: 'block', height: '100%', width: `${pct(value, max)}%`, background: good === false ? '#9AB6BD' : '#4FAE4E' }} />
      </span>
    </div>
  )
}

export function CourseFeedbackTab({ feedback, saved }: { feedback: CourseFeedbackSummary | null; saved: boolean }) {
  const total = feedback?.total ?? 0
  return (
    <div className="cb-grid">
      <div className="stack g24">
        <div className="card pad stack g8" style={{ background: '#E3F1E4', borderColor: '#B5D8B9' }}>
          <strong>Course Completion Feedback Form · built in</strong>
          <span className="small">Every learner fills in this form when they finish the course. It is required, and their certificate opens as soon as they send it. The questions follow HSN&apos;s feedback template. Answers appear below and in Feedback in the menu.</span>
        </div>

        {!saved && <div className="note"><span>Save the course first. Feedback answers for this course will then show here.</span></div>}
        {saved && total === 0 && (
          <div className="card pad stack g8" style={{ alignItems: 'center', textAlign: 'center' }}>
            <strong>No feedback yet</strong>
            <span className="small muted">Answers appear here as soon as the first learner finishes the course and sends the form.</span>
          </div>
        )}

        {feedback && total > 0 && (
          <>
            <div className="row g24" style={{ flexWrap: 'wrap' }}>
              <span className="stack"><b style={{ fontSize: '26px', color: '#134E5E' }}>{total}</b><span className="small muted">{total === 1 ? 'response' : 'responses'}</span></span>
              <span className="stack"><b style={{ fontSize: '26px', color: '#0B6B3A' }}>{pct(feedback.recommend[0]?.count ?? 0, total)}%</b><span className="small muted">would definitely recommend</span></span>
            </div>
            <fieldset className="cb-fs stack g12">
              <legend>1. Overall Experience</legend>
              <span className="small strong">Overall satisfaction</span>
              {feedback.overall.map((o) => <Bar key={o.label} label={o.label} value={o.count} max={total} text={`${o.count} (${pct(o.count, total)}%)`} />)}
              <span className="small strong" style={{ marginTop: '8px' }}>Would recommend to a colleague</span>
              {feedback.recommend.map((o) => <Bar key={o.label} label={o.label} value={o.count} max={total} text={`${o.count} (${pct(o.count, total)}%)`} />)}
            </fieldset>
            <fieldset className="cb-fs stack g12">
              <legend>2. Course Content &amp; Design · average out of 5</legend>
              {feedback.content.map((c) => <Bar key={c.label} label={c.label} value={c.avg ?? 0} max={5} text={c.avg === null ? '–' : `${c.avg.toFixed(1)} / 5`} good={(c.avg ?? 0) >= 3.5} />)}
            </fieldset>
            <fieldset className="cb-fs stack g12">
              <legend>3. Online Platform &amp; Delivery · average out of 5</legend>
              {feedback.platform.map((c) => <Bar key={c.label} label={c.label} value={c.avg ?? 0} max={5} text={c.avg === null ? '–' : `${c.avg.toFixed(1)} / 5`} good={(c.avg ?? 0) >= 3.5} />)}
            </fieldset>
            <fieldset className="cb-fs stack g16">
              <legend>4–5. Written answers (latest 5 each)</legend>
              {feedback.open.map((q) => (
                <div key={q.question} className="stack g8">
                  <span className="small strong">{q.question}</span>
                  {q.answers.length === 0 && <span className="small muted">No answers yet.</span>}
                  {q.answers.map((a) => (
                    <div key={a.id} className="card pad stack g4" style={{ padding: '12px 14px' }}>
                      <span className="small" style={{ whiteSpace: 'pre-line' }}>“{a.text}”</span>
                      <span className="small muted">{a.name} · <a href={`/admin/feedback/${a.id}`}>Open</a></span>
                    </div>
                  ))}
                </div>
              ))}
            </fieldset>
          </>
        )}
      </div>

      <aside className="stack g12 sticky">
        {feedback && total > 0 && (
          <div className="card pad stack g8">
            <h3 className="h5" style={{ margin: 0 }}>Latest responses</h3>
            {feedback.latest.map((r) => (
              <a key={r.id} href={`/admin/feedback/${r.id}`} className="row between g8 small" style={{ textDecoration: 'none', color: '#17323A', padding: '6px 0', borderBottom: '1px solid #EDE7D8' }}>
                <span className="strong">{r.name}</span><span className="muted">{r.overall} · {r.when}</span>
              </a>
            ))}
            <a className="btn btn-s btn-sm self-start" href="/admin/feedback">See all feedback</a>
          </div>
        )}
        <details className="card pad" open={total === 0}>
          <summary className="strong" style={{ cursor: 'pointer' }}>The questions learners answer</summary>
          <div className="stack g12" style={{ marginTop: '12px' }}>
            <span className="small muted">Course title, delegate name and completion date are filled in automatically.</span>
            {FORM.map((s) => (
              <div key={s.title} className="stack g4">
                <strong className="small">{s.title}</strong>
                {s.intro && <span className="small muted">{s.intro}</span>}
                <ul className="small" style={{ margin: 0, paddingInlineStart: '18px' }}>{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            ))}
          </div>
        </details>
      </aside>
    </div>
  )
}
