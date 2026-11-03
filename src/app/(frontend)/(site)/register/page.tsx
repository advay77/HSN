// Ported from Register.dc.html: course registration (cohort / webinar sign-up) for one course, /register?course=<slug>.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { RegisterForm } from '@/components/courses/RegisterForm'
import { requireMember } from '@/lib/auth/guard'
import { getCourseBySlug, visibleModules } from '@/lib/courses/data'

export const metadata: Metadata = { title: 'Register for the Course' }
export const dynamic = 'force-dynamic'

const LEVEL_CLS: Record<string, string> = { Beginner: 'bdg b-beg', Intermediate: 'bdg b-int', Advanced: 'bdg b-adv' }

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const { course: slug } = await searchParams
  const course = slug ? await getCourseBySlug(slug) : null
  if (!course) notFound()
  const member = await requireMember(`/register?course=${encodeURIComponent(slug ?? '')}`)
  const mods = visibleModules(course).length
  const href = `/courses/${course.slug}`

  return (
    <main>
      <section className="sec" style={{ paddingTop: '48px' }}>
        <div className="wrap stack g32">
          <div className="side-r">
            <RegisterForm
              courseSlug={course.slug!}
              courseTitle={course.title}
              courseHref={href}
              sessions={(course.sessions ?? []).map((s) => s.label)}
              defaults={{ name: member?.name ?? '', email: member?.email ?? '' }}
            />
            <aside className="card stack sticky" style={{ overflow: 'hidden' }}>
              <div className="media" style={{ background: course.coverColor || '#0B6B3A', height: '120px' }}><svg className="deco" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#4FAE4E" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true"><path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15"></path><path d="M5 19 13 11"></path></svg>{course.featured && <span className="bdg b-feat">Featured course</span>}</div>
              <div className="pad stack g12">
                <span className={`${LEVEL_CLS[course.level] ?? 'bdg b-beg'} self-start`}>{course.level}</span>
                <h2 className="h4">{course.title}</h2>
                <span className="small muted strong">{mods} {mods === 1 ? 'module' : 'modules'}{course.facts?.duration ? ` · ${course.facts.duration}` : ''}</span>
                <hr className="divider" />
                <span className="small muted">{course.description}</span>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}
