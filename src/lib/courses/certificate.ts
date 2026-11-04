import 'server-only'

import crypto from 'node:crypto'

import { getPayloadClient } from '@/lib/payload'

// Certificate IDs look like HSN-42-7F3A9C1B: the enrollment number plus a signature only the server can make,
// so anyone can check a certificate at /verify/<id> and nobody can guess a valid one.
const sign = (enrollmentId: string | number) =>
  crypto.createHmac('sha256', `certificate:${process.env.PAYLOAD_SECRET}`).update(String(enrollmentId)).digest('hex').slice(0, 8).toUpperCase()

export const certificateId = (enrollmentId: string | number) => `HSN-${enrollmentId}-${sign(enrollmentId)}`

export type VerifiedCertificate = { id: string; name: string; course: string; slug: string; issued: string }

/** Looks up a certificate by its ID; null when the ID is wrong or the course is not complete. */
export async function verifyCertificate(id: string): Promise<VerifiedCertificate | null> {
  const m = /^HSN-(\d{1,12})-([0-9A-F]{8})$/.exec(id.trim().toUpperCase())
  if (!m) return null
  const [, enrollmentId, sig] = m
  if (!crypto.timingSafeEqual(Buffer.from(sig!), Buffer.from(sign(enrollmentId!)))) return null
  const payload = await getPayloadClient()
  const e = await payload.findByID({ collection: 'enrollments', id: Number(enrollmentId), depth: 1, overrideAccess: true }).catch(() => null)
  if (!e || !e.completedAt || (e.progress ?? 0) < 100) return null
  const member = typeof e.member === 'object' ? e.member : null
  const course = typeof e.course === 'object' ? e.course : null
  if (!member || !course) return null
  return { id: certificateId(e.id), name: member.name, course: course.title, slug: course.slug || '', issued: e.completedAt }
}

export const formatIssued = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: process.env.SITE_TIMEZONE || 'Asia/Kolkata' })
