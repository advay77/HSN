// Quiz results, like a Google Form summary: per quiz the takers, passes and average score; per question how many
// answered right and which answers people picked (correct answer marked); then every learner's result.
import React from 'react'

import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { requireAdmin } from '@/lib/admin/auth'
import { listQuizResults } from '@/lib/admin/quizzes'
import { formatIssuedAt } from '@/lib/courses/certificate'

export const metadata = { title: 'Quiz results' }
export const dynamic = 'force-dynamic'

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0)

export default async function AdminQuizzesPage() {
  const admin = await requireAdmin('/admin/quizzes')
  const courses = await listQuizResults()
  const totalTakers = courses.reduce((a, c) => a + c.quizzes.reduce((b, q) => b + q.takers, 0), 0)

  return (
    <>
      <AdminTopbar
        initial={admin.initial}
        left={
          <div className="stack g4">
            <h1 className="h2" style={{ margin: 0 }}>Quiz results</h1>
            <span className="small muted">{totalTakers} quiz {totalTakers === 1 ? 'result' : 'results'} so far · right answers and scores for every quiz</span>
          </div>
        }
      />
      <main className="amain">
        {courses.every((c) => c.quizzes.length === 0) && (
          <div className="card pad stack g8" style={{ alignItems: 'center', textAlign: 'center' }}>
            <strong>No quizzes yet</strong>
            <span className="small muted">Add a quiz to a module in Courses → Modules &amp; lessons. Results appear here as soon as learners answer it.</span>
          </div>
        )}
        {courses.filter((c) => c.quizzes.length > 0).map((c) => (
          <section key={c.id} className="stack g16" aria-labelledby={`c-${c.id}`}>
            <h2 className="h3" id={`c-${c.id}`} style={{ margin: 0 }}>{c.title}</h2>
            {c.quizzes.map((q) => (
              <article key={q.key} className="card pad-l stack g20">
                <div className="row between g12" style={{ flexWrap: 'wrap' }}>
                  <div className="stack g4">
                    <span className="over">{q.module}</span>
                    <h3 className="h4" style={{ margin: 0 }}>{q.title} · {q.questions} {q.questions === 1 ? 'question' : 'questions'}</h3>
                  </div>
                  <div className="row g24" style={{ flexWrap: 'wrap' }}>
                    <span className="stack"><b style={{ fontSize: '22px', color: '#134E5E' }}>{q.takers}</b><span className="small muted">took it</span></span>
                    <span className="stack"><b style={{ fontSize: '22px', color: '#0B6B3A' }}>{q.passed}</b><span className="small muted">passed</span></span>
                    <span className="stack"><b style={{ fontSize: '22px', color: '#134E5E' }}>{q.avgScore === null ? '–' : `${q.avgScore.toFixed(1)} / ${q.questions}`}</b><span className="small muted">average score</span></span>
                  </div>
                </div>

                {q.questions === 0 && <span className="small muted">This quiz has no questions yet.</span>}
                {q.questionStats.map((s) => (
                  <div key={s.n} className="stack g8" style={{ paddingTop: '16px', borderTop: '1px solid #EDE7D8' }}>
                    <div className="row between g12" style={{ flexWrap: 'wrap', alignItems: 'baseline' }}>
                      <strong>{s.n}. {s.text}</strong>
                      <span className="small strong" style={{ color: s.answered && pct(s.right, s.answered) < 50 ? '#B3261E' : '#0B6B3A' }}>{s.answered ? `${s.right} of ${s.answered} right (${pct(s.right, s.answered)}%)` : 'No answers saved yet'}</span>
                    </div>
                    {s.options.map((o, oi) => (
                      <div key={oi} className="stack g4">
                        <span className="small" style={{ color: o.correct ? '#0B6B3A' : '#17323A', fontWeight: o.correct ? 600 : 400 }}>
                          {o.text}
                          {o.correct && <span className="bdg b-ok" style={{ marginInlineStart: '8px' }}>Correct answer</span>}
                          <span className="muted" style={{ marginInlineStart: '8px' }}>{o.picked} {o.picked === 1 ? 'person' : 'people'}</span>
                        </span>
                        <span aria-hidden="true" style={{ display: 'block', height: '10px', borderRadius: '5px', background: '#EDE7D8', overflow: 'hidden' }}>
                          <span style={{ display: 'block', height: '100%', width: `${pct(o.picked, s.answered)}%`, background: o.correct ? '#4FAE4E' : '#9AB6BD' }} />
                        </span>
                      </div>
                    ))}
                  </div>
                ))}

                {q.learners.length > 0 && (
                  <details>
                    <summary className="strong" style={{ cursor: 'pointer' }}>Learner results ({q.learners.length})</summary>
                    <div style={{ overflowX: 'auto', marginTop: '12px' }}>
                      <table className="atbl m" style={{ minWidth: '720px' }}>
                        <thead><tr><th scope="col">Learner</th><th scope="col">Score</th><th scope="col">Result</th><th scope="col">Attempts</th><th scope="col">Last attempt</th></tr></thead>
                        <tbody>
                          {q.learners.map((r, i) => (
                            <tr key={i}>
                              <td><strong>{r.name}</strong>{r.email && <><br /><span className="small muted">{r.email}</span></>}</td>
                              <td data-l="Score" className="strong">{r.score} / {r.total}</td>
                              <td data-l="Result"><span className={r.passed ? 'bdg b-ok' : 'bdg b-reg'}>{r.passed ? 'Passed' : 'Not passed'}</span></td>
                              <td data-l="Attempts" className="small">{r.attempts}</td>
                              <td data-l="Last attempt" className="small">{formatIssuedAt(r.at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                )}
              </article>
            ))}
          </section>
        ))}
        <p className="small muted">Which answer each person picked is saved from 11 November 2026 onwards; older results show the score only.</p>
      </main>
    </>
  )
}
