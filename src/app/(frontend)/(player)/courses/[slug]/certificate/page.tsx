// Course certificate: made automatically when a member finishes every lesson (and passes any quizzes).
// Download as PDF through the browser's print dialog; anyone can check it at /verify/<id>.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import '@/app/(frontend)/styles/pages/certificate.css'

import { CertificateActions } from '@/components/courses/CertificateActions'
import { CertificateSheet } from '@/components/courses/CertificateSheet'
import { requireMember } from '@/lib/auth/guard'
import { certificateId, certificateQr, formatIssued } from '@/lib/courses/certificate'
import { getCourseBySlug, getEnrollment, progressOf } from '@/lib/courses/data'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Certificate', robots: { index: false } }

type Props = { params: Promise<{ slug: string }> }

export default async function CertificatePage({ params }: Props) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  if (!course) notFound()
  const member = await requireMember(`/courses/${slug}/certificate`)
  const enrollment = await getEnrollment(member.id, course.id)
  const progress = progressOf(course, enrollment)
  const enabled = course.certificate?.enabled !== false
  const issuer = course.certificate?.issuer || 'Healthcare Sustainability Network'

  if (!enabled || !enrollment || progress < 100) {
    return (
      <main className="cert-wrap">
        <div className="cert-note card pad stack g16">
          <h1 className="h3">{enabled ? 'Your certificate is not ready yet' : 'This course has no certificate'}</h1>
          {enabled && (
            <>
              <p>Finish every lesson{course.modules?.some((m) => m.lessons?.some((l) => l.type === 'quiz')) ? ' and pass each module quiz' : ''} in <b>{course.title}</b> and your certificate is created automatically.</p>
              <div className="prog" aria-label={`${progress}% complete`}><span style={{ width: `${progress}%` }} /></div>
              <p className="small muted">{progress}% complete</p>
            </>
          )}
          <div className="row g12" style={{ flexWrap: 'wrap' }}>
            <a className="btn btn-p" href={`/courses/${slug}/learn`}>{progress > 0 ? 'Continue course' : 'Start course'}</a>
            <a className="btn btn-s" href="/my">Back to My HSN</a>
          </div>
        </div>
      </main>
    )
  }

  // Course feedback is required before the certificate is shown.
  const payload = await getPayloadClient()
  const feedback = await payload.find({
    collection: 'course-feedback',
    where: { and: [{ member: { equals: member.id } }, { course: { equals: course.id } }] },
    limit: 1,
    depth: 0,
  })
  if (!feedback.docs.length) {
    return (
      <main className="cert-wrap">
        <div className="cert-note card pad stack g16">
          <h1 className="h3">One last step: share your feedback</h1>
          <p>You have finished <b>{course.title}</b>. Well done. Please fill in the short course feedback form. It is required, and your certificate opens as soon as you send it.</p>
          <div className="row g12" style={{ flexWrap: 'wrap' }}>
            <a className="btn btn-p" href={`/courses/${slug}/feedback`}>Give feedback</a>
            <a className="btn btn-s" href="/my">Back to My HSN</a>
          </div>
        </div>
      </main>
    )
  }

  const id = certificateId(enrollment.id)
  const issued = enrollment.completedAt || enrollment.updatedAt
  const site = (process.env.SITE_URL || 'https://healthcaresustainabilitynetwork.com').replace(/\/$/, '')
  const verifyUrl = `${site}/verify/${id}`
  const qr = await certificateQr(verifyUrl)
  const d = new Date(issued)
  const linkedIn =
    'https://www.linkedin.com/profile/add?' +
    new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: course.title,
      organizationName: issuer,
      issueYear: String(d.getFullYear()),
      issueMonth: String(d.getMonth() + 1),
      certUrl: verifyUrl,
      certId: id,
    }).toString()

  return (
    <main className="cert-wrap">
      {/* Script font for the signature line. */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" />
      <CertificateActions linkedIn={linkedIn} />
      <CertificateSheet name={member.name} course={course.title} issued={formatIssued(issued)} id={id} verifyUrl={verifyUrl} qr={qr} issuer={issuer} />
    </main>
  )
}
