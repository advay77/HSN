// Ported from Course.dc.html. Everything on the page comes from the course in the CMS.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import '../../../styles/pages/course.css'
import '../../../styles/pages/certificate.css'

import { CourseModules, SaveButton, type ModuleView } from '@/components/courses/CourseClient'
import { CertificateSheet } from '@/components/courses/CertificateSheet'
import { CourseTagRow } from '@/components/courses/CourseTags'
import { certificateQr, formatIssued } from '@/lib/courses/certificate'
import { courseTestimonials } from '@/lib/courses/testimonials'
import { getCurrentMember } from '@/lib/auth/session'
import {
  availableModules,
  getCourseBySlug,
  getEnrollment,
  hasVideo,
  isQuiz,
  media,
  moduleMeta,
  passNeeded,
  topicKind,
  visibleModules,
} from '@/lib/courses/data'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourseBySlug((await params).slug)
  return course ? { title: course.title, description: course.description } : {}
}

const LEVEL_CLS: Record<string, string> = { Beginner: 'bdg b-beg', Intermediate: 'bdg b-int', Advanced: 'bdg b-adv' }
const plural = (n: number, w: string) => `${n} ${n === 1 ? w : w + 's'}`

export default async function CoursePage({ params }: Props) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  if (!course) notFound()
  const member = await getCurrentMember()
  const enrollment = member ? await getEnrollment(member.id, course.id) : null

  const href = `/courses/${course.slug}`
  const learnHref = `${href}/learn`
  const cover = media(course.cover)
  const mods = visibleModules(course)
  const avail = availableModules(course)

  // Facts strip
  const firstAvail = avail[0]
  const availLessons = avail.flatMap((m) => m.lessons ?? [])
  const lessonCount = availLessons.filter((l) => !isQuiz(l)).length
  const quizCount = availLessons.filter(isQuiz).length
  const lessonSub =
    avail.length === 1
      ? `in Module ${mods.indexOf(firstAvail!) + 1}${quizCount ? (quizCount === 1 ? ', plus a quiz' : ', plus quizzes') : ''}`
      : `across ${plural(avail.length, 'module')}${quizCount ? ', plus quizzes' : ''}`
  const modulesSub =
    avail.length === mods.length
      ? 'All available now'
      : avail.length === 1
        ? `Module ${mods.indexOf(firstAvail!) + 1} available now`
        : avail.length === 0
          ? 'Coming soon'
          : `${avail.length} available now`
  const certOn = course.certificate?.enabled !== false
  const { items: testimonials, summary: fbSummary } = await courseTestimonials(course.id)
  // Every module "Coming soon": the course is shown but cannot be started yet.
  const soon = avail.length === 0
  const SoonButton = ({ light = false }: { light?: boolean }) => <span className={light ? 'btn btn-lg btn-light' : 'btn btn-p btn-lg'} aria-disabled="true" style={{ opacity: 0.7, cursor: 'default' }}>Coming soon</span>

  const moduleViews: ModuleView[] = mods.map((m, i) => {
    const lessons = m.lessons ?? []
    return {
      n: String(i + 1),
      title: m.title,
      meta: moduleMeta(m),
      locked: m.status !== 'available',
      topics: lessons.length
        ? lessons.map((l) => ({
            title: isQuiz(l) ? `${l.title} · ${plural(l.questions?.length ?? 0, 'question')}` : l.title,
            kind: topicKind(l),
          }))
        : [{ title: 'Lessons will be added soon', kind: '' }],
    }
  })

  const firstQuiz = availLessons.find(isQuiz)
  const qn = firstQuiz?.questions?.length ?? 0
  const quizStep = qn
    ? `Get at least ${passNeeded(course, qn)} of ${qn} answers right.${course.certificate?.retakes !== false ? ' You can retake it.' : ''}`
    : `Score at least ${course.certificate?.passMark ?? 80}%.${course.certificate?.retakes !== false ? ' You can retake it.' : ''}`
  const aboutParas = (course.about || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  const issuer = course.certificate?.issuer || 'Healthcare Sustainability Network'
  // Example certificate: its QR opens the public verify page.
  const sampleVerify = `${(process.env.SITE_URL || 'https://healthcaresustainabilitynetwork.com').replace(/\/$/, '')}/verify/EXAMPLE`
  const sampleQr = certOn ? await certificateQr(sampleVerify) : ''
  // Admin label on the cover; left unset, the label follows who can take the course.
  const badge = course.coverBadge ?? (course.audience === 'members' ? 'Free for members' : 'Free course')

  return (
    <main>
      {/* Hero */}
      <section className="sec" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="wrap stack g32">
          <div className="cr-hero">
            <div className="stack g20">
              <CourseTagRow access={course.access === 'paid' ? 'paid' : 'open'} registration={course.tagRegistration !== false}>
                <span className={LEVEL_CLS[course.level] ?? 'bdg b-beg'}>{course.level}</span>
                {course.tagSelfPaced !== false && <span className="bdg b-reg">Self-paced</span>}
                {(course.tagVideo ?? hasVideo(course)) && <span className="bdg b-reg">Contains video</span>}
                {(course.tags ?? []).map((t) => <span key={t.id} className="bdg b-reg">{t.label}</span>)}
              </CourseTagRow>
              <h1 className="sec-title hero-title" style={{ textTransform: 'none', letterSpacing: '0' }}>{course.title}</h1>
              <p className="lead measure">{course.description}</p>
              <div className="row g12 mstack" style={{ paddingTop: '4px' }}>
                {soon ? <SoonButton /> : <a className="btn btn-p btn-lg" href={learnHref}>{enrollment && (enrollment.progress ?? 0) > 0 ? 'Continue course' : 'Start course now'}{' '}<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg></a>}
                <SaveButton courseId={course.id} initial={!!enrollment?.savedForLater} signedIn={!!member} loginHref={`/login?next=${encodeURIComponent(href)}`} />
              </div>
              <span className="row g12 small muted"><img src="/images/hsn-logo.jpg" alt="" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} /><span>Created by{' '}<strong style={{ color: '#17323A' }}>{course.createdBy || 'Healthcare Sustainability Network'}</strong></span></span>
            </div>
            <div className="cr-cover" style={cover?.url ? undefined : { background: course.coverColor || '#134E5E', aspectRatio: '16 / 9' }}>
              {cover?.url && <img src={cover.url} alt={cover.alt || ''} />}
              {badge && <span className="bdg b-feat">{badge}</span>}
            </div>
          </div>
          <div className="cr-stats" role="list" aria-label="Course facts">
            <div className="cr-stat" role="listitem"><b>{plural(mods.length, 'module')}</b><span>{modulesSub}</span></div>
            <div className="cr-stat" role="listitem"><b>{plural(lessonCount, 'lesson')}</b><span>{lessonSub}</span></div>
            <div className="cr-stat" role="listitem">{course.facts?.duration ? (<><b>{course.facts.duration}</b><span>Average time to finish</span></>) : (<><b>Self-paced</b><span>Learn at your own pace</span></>)}</div>
            <div className="cr-stat" role="listitem"><b>{course.facts?.language || 'English'}</b><span>{course.facts?.languageNote || 'More languages coming soon'}</span></div>
            <div className="cr-stat" role="listitem"><b>Certificate</b><span>{certOn ? 'On completion' : 'Not included'}</span></div>
          </div>
        </div>
      </section>
      {/* Learning outcomes */}
      {((course.outcomes?.length ?? 0) > 0 || (course.skills?.length ?? 0) > 0) && (
        <section className="sec bg-surface" aria-labelledby="lo">
          <div className="wrap stack g32">
            <div className="stack g12">
              <h2 className="sec-title" id="lo">What You Will Learn</h2>
              {course.learnIntro && <p className="lead muted">{course.learnIntro}</p>}
            </div>
            {(course.outcomes?.length ?? 0) > 0 && (
              <ul className="cr-out">
                {course.outcomes!.map((o) => (
                  <li key={o.id}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B6B3A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg><span>{o.text}</span></li>
                ))}
              </ul>
            )}
            {(course.skills?.length ?? 0) > 0 && (
              <div className="stack g12">
                <span className="h5">Skills you will build</span>
                <div className="row g8">{course.skills!.map((s) => <span key={s.id} className="cr-skill">{s.label}</span>)}</div>
              </div>
            )}
          </div>
        </section>
      )}
      {/* About */}
      {aboutParas.length > 0 && (
        <section className="sec" aria-labelledby="ab">
          <div className="wrap">
            <div className="stack g20">
              <h2 className="sec-title" id="ab">About This Course</h2>
              {aboutParas.map((p, i) => <p key={i} className={i === 0 ? 'lead' : 'muted'}>{p}</p>)}
            </div>
          </div>
        </section>
      )}
      {/* Modules */}
      {soon && (
        <section className="sec" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="wrap"><div className="note" role="status"><span><b>Coming soon.</b> This course is being prepared for accreditation. Save it now and we will let you know when it opens.</span></div></div>
        </section>
      )}
      <CourseModules modules={moduleViews} learnHref={soon ? '' : learnHref} />
      {/* What learners say: feedback learners agreed to share and HSN chose to show */}
      {(testimonials.length > 0 || fbSummary) && (
        <section className="sec" aria-labelledby="ls">
          <div className="wrap stack g24">
            <div className="stack g8">
              <h2 className="sec-title" id="ls">What Learners Say</h2>
              {fbSummary && <p className="muted">{fbSummary.recommendPct}% would recommend this course · rated {fbSummary.averageRating} out of 5 on average · {fbSummary.responses} responses</p>}
            </div>
            {testimonials.length > 0 && (
              <div className="grid c3 t1 g24">
                {testimonials.map((t) => (
                  <figure key={t.id} className="card pad stack g12" style={{ margin: 0 }}>
                    <span className="bdg b-ok" style={{ alignSelf: 'flex-start' }}>{t.rating}</span>
                    <blockquote style={{ margin: 0, fontSize: '17px', lineHeight: 1.6 }}>“{t.quote}”</blockquote>
                    <figcaption className="small strong muted">{t.name}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      {/* Certificate */}
      {certOn && (
        <section className="sec" aria-labelledby="ce">
          <div className="wrap">
            <div className="bg-green cr-cert">
              <div className="stack g24">
                <div className="stack g12">
                  <h2 className="sec-title" id="ce">{course.certificate?.heading || 'Earn Your HSN Certificate'}</h2>
                  <p className="box-body">{course.certificate?.text || 'Receive a Healthcare Sustainability Network certificate when you finish the course. Add it to your CV and LinkedIn profile to show your commitment to sustainable, high-quality care.'}</p>
                </div>
                <ol className="cr-steps">
                  <li><span className="cr-step-n">1</span><span><b>{course.certificate?.step1 || 'Complete every lesson'}</b><span>Work through all modules at your own pace.</span></span></li>
                  {firstQuiz && <li><span className="cr-step-n">2</span><span><b>{course.certificate?.step2 || 'Pass each module quiz'}</b><span>{quizStep}</span></span></li>}
                  <li><span className="cr-step-n">{firstQuiz ? 3 : 2}</span><span><b>{course.certificate?.step3 || 'Download and share'}</b><span>Save your certificate as a PDF or add it to LinkedIn.</span></span></li>
                </ol>
                <div className="row g16 mstack" style={{ alignItems: 'center' }}>{soon ? <SoonButton light /> : <a className="btn btn-lg btn-light" href={learnHref}>Start course now</a>}</div>
              </div>
              <figure className="cr-sample">
                <CertificateSheet name={member?.name || 'Your Name'} course={course.title} issued={formatIssued(new Date().toISOString())} id="EXAMPLE" verifyUrl={sampleVerify} qr={sampleQr} issuer={issuer} />
                <figcaption>Example certificate</figcaption>
              </figure>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
