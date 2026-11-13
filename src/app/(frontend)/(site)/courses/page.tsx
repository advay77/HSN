// Ported from Courses.dc.html. Courses come from the CMS (published only).
import type { Metadata } from 'next'
import React from 'react'

import { CourseLibrary, type CourseCard } from '@/components/courses/CourseLibrary'
import { CourseTagRow } from '@/components/courses/CourseTags'
import { getCurrentMember } from '@/lib/auth/session'
import { getEnrollmentsFor, getPublishedCourses, hasVideo, media, progressOf, visibleModules, availableModules } from '@/lib/courses/data'

export const metadata: Metadata = { title: 'Courses' }
export const dynamic = 'force-dynamic'

// Logged-out visitors never see progress (design rule); members get Continue / Review labels.
const ctaFor = (progress: number, start: string, cont: string) =>
  progress === 0 ? start : progress === 100 ? 'Review course' : cont

export default async function CoursesPage() {
  const [courses, member] = await Promise.all([getPublishedCourses(), getCurrentMember()])
  const enrollments = member ? await getEnrollmentsFor(member.id) : []
  const progressFor = (c: (typeof courses)[number]) => {
    const e = enrollments.find((x) => (typeof x.course === 'object' ? x.course.id : x.course) === c.id)
    return e ? progressOf(c, e) : 0
  }

  const cards: CourseCard[] = courses.map((c) => {
    const mods = visibleModules(c).length
    return {
      slug: c.slug!,
      title: c.title,
      description: c.description,
      level: c.level,
      kind: c.kind,
      color: c.coverColor || '#134E5E',
      duration: c.facts?.duration || '',
      meta: `${mods} ${mods === 1 ? 'module' : 'modules'}`,
      cta: availableModules(c).length === 0 ? 'Coming soon' : member ? ctaFor(progressFor(c), 'View course', 'Continue') : 'View course',
      access: c.access === 'paid' ? 'paid' : 'open',
      registration: c.tagRegistration !== false,
    }
  })

  const f = courses.find((c) => c.featured)
  const featured = f
    ? {
        slug: f.slug!,
        title: f.title,
        description: f.description,
        level: f.level,
        // The admin's modules number when set, else the modules added.
        modules: f.facts?.modules && f.facts.modules >= 1 ? Math.floor(f.facts.modules) : visibleModules(f).length,
        video: hasVideo(f),
        access: f.access === 'paid' ? ('paid' as const) : ('open' as const),
        registration: f.tagRegistration !== false,
        cover: media(f.cover)?.url ?? null,
        cta: availableModules(f).length === 0 ? 'Coming soon' : member ? ctaFor(progressFor(f), 'Start course', 'Continue course') : 'Start course',
      }
    : null

  return (
    <main>
      <section className="sec" style={{ paddingTop: '48px', paddingBottom: '40px' }}>
        <div className="wrap stack g32">
          <div className="stack g20">
            <h1 className="sec-title hero-title">Courses</h1>
            <p className="lead">Self-paced courses with short lessons, videos and quizzes that help healthcare professionals turn sustainability into safer, higher-quality care.</p>
          </div>
        </div>
      </section>
      {/* Featured */}
      {featured && (
        <section aria-labelledby="ft">
          <div className="wrap">
            <a href={`/courses/${featured.slug}`} className="card card-link" style={{ flexDirection: 'row', flexWrap: 'wrap', overflow: 'hidden' }}>
              <div style={{ position: 'relative', flex: '1 1 360px', minHeight: '220px', background: featured.cover ? '#F5F1E6' : '#134E5E' }}>
                {featured.cover && (
                  <img src={featured.cover} alt="" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain', padding: '48px 24px 24px', boxSizing: 'border-box' }} />
                )}
              </div>
              <div className="pad-l stack g16" style={{ flex: '2 1 480px' }}>
                <CourseTagRow access={featured.access} registration={featured.registration}>
                  <span className={LEVEL_CLS[featured.level] ?? 'bdg b-beg'}>{featured.level}</span>
                  <span className="bdg b-reg">{featured.modules} {featured.modules === 1 ? 'Module' : 'Modules'}</span>
                  {featured.video && <span className="bdg b-reg">Contains video</span>}
                </CourseTagRow>
                <h2 className="h2" id="ft">{featured.title}</h2>
                <p className="muted measure">{featured.description}</p>
                <span className="btn btn-p self-start" style={{ marginTop: '4px' }}>{featured.cta}</span>
              </div>
            </a>
          </div>
        </section>
      )}
      {/* Library */}
      <CourseLibrary courses={cards} />
    </main>
  )
}

const LEVEL_CLS: Record<string, string> = { Beginner: 'bdg b-beg', Intermediate: 'bdg b-int', Advanced: 'bdg b-adv' }
