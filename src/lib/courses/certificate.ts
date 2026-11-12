import 'server-only'

import crypto from 'node:crypto'

import QRCode from 'qrcode'

import { getPayloadClient } from '@/lib/payload'

// Certificate IDs look like HSN-NOV2026-0001-482913: the month and year the course was completed, the
// certificate number (1, 2, 3… in order of completion, restartable at 0001 from Admin → Certificates), then a
// 6-digit check number only the server can make, so anyone can check a certificate at /verify/<id> and nobody can
// guess a valid one. Digits only after the date, so no accidental words (such as "FEB") appear.
// Older IDs still verify: HSN-42-7F3A9C1B (before 12 Nov 2026) and HSN-NOV2026-0042-…, where 0042 was the
// enrollment number (12 Nov 2026 only). Certificates issued before a restart (number 0) keep the HSN-42-… form.
const zone = () => process.env.SITE_TIMEZONE || 'Asia/Kolkata'
const hmac = (text: string) => crypto.createHmac('sha256', `certificate:${process.env.PAYLOAD_SECRET}`).update(text).digest('hex')
const legacySign = (enrollmentId: string | number) => hmac(String(enrollmentId)).slice(0, 8).toUpperCase()
const six = (text: string) => String(parseInt(hmac(text).slice(0, 10), 16) % 1_000_000).padStart(6, '0')
const check = (certificateNo: number, monthYear: string) => six(`c${certificateNo}:${monthYear}`)
const checkByEnrollment = (enrollmentId: number, monthYear: string) => six(`${enrollmentId}:${monthYear}`)

/** "NOV2026" for the month and year of the date, in the site's time zone. */
const monthYearOf = (iso: string) => {
  const parts = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: zone() }).formatToParts(new Date(iso))
  const mon = (parts.find((p) => p.type === 'month')?.value || '').slice(0, 3).toUpperCase()
  return `${mon}${parts.find((p) => p.type === 'year')?.value || ''}`
}

type IdSource = { id: number | string; certificateNo?: number | null; completedAt?: string | null; updatedAt?: string }

export const certificateId = (e: IdSource) => {
  const no = Number(e.certificateNo ?? 0)
  const when = e.completedAt || e.updatedAt
  if (no > 0 && when) {
    const my = monthYearOf(when)
    return `HSN-${my}-${String(no).padStart(4, '0')}-${check(no, my)}`
  }
  return `HSN-${e.id}-${legacySign(e.id)}`
}

export type VerifiedCertificate = { id: string; name: string; course: string; slug: string; issued: string }

const same = (a: string, b: string) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))

/** Looks up a certificate by its ID; null when the ID is wrong or the course is not complete. */
export async function verifyCertificate(id: string): Promise<VerifiedCertificate | null> {
  const raw = id.trim().toUpperCase()
  const payload = await getPayloadClient()
  const byId = (n: number) => payload.findByID({ collection: 'enrollments', id: n, depth: 1, overrideAccess: true }).catch(() => null)
  let e: Awaited<ReturnType<typeof byId>> = null
  let monthYear: string | null = null

  const current = /^HSN-([A-Z]{3}\d{4})-(\d{1,12})-(\d{6})$/.exec(raw)
  const legacy = /^HSN-(\d{1,12})-([0-9A-F]{8})$/.exec(raw)
  if (current) {
    const [, my, num, sig] = current
    monthYear = my!
    if (same(sig!, check(Number(num), my!))) {
      const found = await payload.find({ collection: 'enrollments', where: { certificateNo: { equals: Number(num) } }, limit: 1, depth: 1, overrideAccess: true })
      e = found.docs[0] ?? null
    } else if (same(sig!, checkByEnrollment(Number(num), my!))) {
      e = await byId(Number(num))
    } else return null
  } else if (legacy) {
    const [, num, sig] = legacy
    if (!same(sig!, legacySign(num!))) return null
    e = await byId(Number(num))
  } else return null

  if (!e || !e.completedAt || (e.progress ?? 0) < 100) return null
  // A month-and-year ID also has to match the month the course was really completed.
  if (monthYear && monthYear !== monthYearOf(e.completedAt)) return null
  const member = typeof e.member === 'object' ? e.member : null
  const course = typeof e.course === 'object' ? e.course : null
  if (!member || !course) return null
  return { id: certificateId(e), name: member.name, course: course.title, slug: course.slug || '', issued: e.completedAt }
}

/** Restarts certificate numbering: certificates issued so far get number 0 (they keep an HSN-42-… ID that still
 *  verifies) and the next completed course becomes 0001. Used once, on launch day. */
export async function restartCertificateNumbers(): Promise<number> {
  const payload = await getPayloadClient()
  const res = await payload.update({ collection: 'enrollments', where: { certificateNo: { greater_than: 0 } }, data: { certificateNo: 0 }, overrideAccess: true, depth: 0 })
  return res.docs.length
}

/** The number the next certificate will get. */
export async function nextCertificateNumber(): Promise<number> {
  const payload = await getPayloadClient()
  const top = await payload.find({ collection: 'enrollments', where: { certificateNo: { greater_than: 0 } }, sort: '-certificateNo', limit: 1, depth: 0, overrideAccess: true })
  return (top.docs[0]?.certificateNo ?? 0) + 1
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
