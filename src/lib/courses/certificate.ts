import 'server-only'

import crypto from 'node:crypto'

import QRCode from 'qrcode'

import { getPayloadClient } from '@/lib/payload'

// Certificate IDs look like HSN-NOV2026-0042-482913: the month and year the course was completed, the enrollment
// number, then a 6-digit check number only the server can make, so anyone can check a certificate at
// /verify/<id> and nobody can guess a valid one. Digits only after the date, so no accidental words (such as
// "FEB") appear. IDs from before 12 Nov 2026 (HSN-42-7F3A9C1B) still verify.
const zone = () => process.env.SITE_TIMEZONE || 'Asia/Kolkata'
const hmac = (text: string) => crypto.createHmac('sha256', `certificate:${process.env.PAYLOAD_SECRET}`).update(text).digest('hex')
const legacySign = (enrollmentId: string | number) => hmac(String(enrollmentId)).slice(0, 8).toUpperCase()
const check = (enrollmentId: string | number, monthYear: string) => String(parseInt(hmac(`${enrollmentId}:${monthYear}`).slice(0, 10), 16) % 1_000_000).padStart(6, '0')

/** "NOV2026" for the month and year of the date, in the site's time zone. */
const monthYearOf = (iso: string) => {
  const parts = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: zone() }).formatToParts(new Date(iso))
  const mon = (parts.find((p) => p.type === 'month')?.value || '').slice(0, 3).toUpperCase()
  return `${mon}${parts.find((p) => p.type === 'year')?.value || ''}`
}

export const certificateId = (enrollmentId: string | number, completedAt: string) => {
  const my = monthYearOf(completedAt)
  return `HSN-${my}-${String(enrollmentId).padStart(4, '0')}-${check(Number(enrollmentId), my)}`
}

export type VerifiedCertificate = { id: string; name: string; course: string; slug: string; issued: string }

const same = (a: string, b: string) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))

/** Looks up a certificate by its ID; null when the ID is wrong or the course is not complete. */
export async function verifyCertificate(id: string): Promise<VerifiedCertificate | null> {
  const raw = id.trim().toUpperCase()
  let enrollmentId: number | null = null
  let monthYear: string | null = null
  const current = /^HSN-([A-Z]{3}\d{4})-(\d{1,12})-(\d{6})$/.exec(raw)
  const legacy = /^HSN-(\d{1,12})-([0-9A-F]{8})$/.exec(raw)
  if (current) {
    const [, my, num, sig] = current
    if (!same(sig!, check(Number(num), my!))) return null
    enrollmentId = Number(num)
    monthYear = my!
  } else if (legacy) {
    const [, num, sig] = legacy
    if (!same(sig!, legacySign(num!))) return null
    enrollmentId = Number(num)
  } else return null

  const payload = await getPayloadClient()
  const e = await payload.findByID({ collection: 'enrollments', id: enrollmentId, depth: 1, overrideAccess: true }).catch(() => null)
  if (!e || !e.completedAt || (e.progress ?? 0) < 100) return null
  // A new-style ID also has to match the month the course was really completed.
  if (monthYear && monthYear !== monthYearOf(e.completedAt)) return null
  const member = typeof e.member === 'object' ? e.member : null
  const course = typeof e.course === 'object' ? e.course : null
  if (!member || !course) return null
  return { id: certificateId(e.id, e.completedAt), name: member.name, course: course.title, slug: course.slug || '', issued: e.completedAt }
}

export const formatIssued = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: zone() })

export const formatIssuedAt = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: zone(),
  })

/** SVG of the public verification link, for printing on the certificate. */
export async function certificateQr(url: string) {
  const svg = await QRCode.toString(url, {
    type: 'svg',
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#17323A', light: '#00000000' },
  })
  return svg.replace(/<\?xml[^>]*>/, '')
}
