import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'

// Writes `activity` rows when members do things, so every sign-in, lesson and form is tracked in one place
// whichever code path saved it. Failures are logged and ignored.
type Type = 'login' | 'signup' | 'lesson' | 'quiz-pass' | 'course-complete' | 'course-registration' | 'case-submitted' | 'membership'

async function record(req: PayloadRequest, type: Type, member: unknown, detail?: string, meta?: Record<string, string>) {
  try {
    await req.payload.create({
      collection: 'activity',
      data: { type, member: member == null ? undefined : Number(member), detail: detail?.slice(0, 200), meta },
      req,
    })
  } catch (e) {
    req.payload.logger.error({ err: e, msg: `[activity] could not record ${type}` })
  }
}

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: string | number }).id : (v as string | number | undefined))

async function courseTitle(req: PayloadRequest, course: unknown) {
  const id = idOf(course)
  if (!id) return undefined
  const c = await req.payload.findByID({ collection: 'courses', id, depth: 0, req }).catch(() => null)
  return c?.title
}

// Browser and device in plain words, e.g. "iPhone · Safari", from the user agent.
export function describeDevice(ua: string) {
  if (!ua) return ''
  const device = /iPad/.test(ua)
    ? 'iPad'
    : /iPhone/.test(ua)
      ? 'iPhone'
      : /Android/.test(ua)
        ? /Mobile/.test(ua) ? 'Android phone' : 'Android tablet'
        : /Macintosh|Windows|Linux|CrOS/.test(ua)
          ? 'Laptop'
          : 'Device'
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\/|Opera/.test(ua)
      ? 'Opera'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Chrome\/|CriOS\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Browser'
  return `${device} · ${browser}`
}

// Device and rough location of the current request (location only where the host adds geo headers).
async function requestMeta(): Promise<{ device: string; location: string }> {
  try {
    const { headers } = await import('next/headers')
    const h = await headers()
    const city = h.get('x-vercel-ip-city')
    const country = h.get('x-vercel-ip-country') || h.get('cf-ipcountry')
    const location = [city ? decodeURIComponent(city) : '', country && country !== 'XX' ? country : ''].filter(Boolean).join(', ')
    return { device: describeDevice(h.get('user-agent') || ''), location }
  } catch {
    // Not inside a web request (scripts, CLI).
    return { device: '', location: '' }
  }
}

export const memberActivity: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  if (operation === 'create') await record(req, 'signup', doc.id)
  if (doc.lastLoginAt && doc.lastLoginAt !== previousDoc?.lastLoginAt) {
    const { device, location } = await requestMeta()
    await record(req, 'login', doc.id, undefined, { method: doc.lastLoginMethod || doc.authProvider || '', device, location })
  }
  return doc
}

export const enrollmentActivity: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const before = Array.isArray(previousDoc?.completedLessons) ? previousDoc.completedLessons.length : 0
  const after = Array.isArray(doc.completedLessons) ? doc.completedLessons.length : 0
  const passedBefore = JSON.stringify(previousDoc?.quizResults ?? null)
  const passedNow = JSON.stringify(doc.quizResults ?? null)
  if (after <= before && passedBefore === passedNow && (!doc.completedAt || previousDoc?.completedAt)) return doc
  const title = await courseTitle(req, doc.course)
  const passes = (s: string) => s.match(/"passed":true/g)?.length ?? 0
  // A passed quiz also marks its lesson complete, so log it once, as the quiz.
  if (passes(passedNow) > passes(passedBefore)) await record(req, 'quiz-pass', idOf(doc.member), title)
  else if (after > before) await record(req, 'lesson', idOf(doc.member), title)
  if (doc.completedAt && !previousDoc?.completedAt) await record(req, 'course-complete', idOf(doc.member), title)
  return doc
}

export const registrationActivity: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation === 'create') await record(req, 'course-registration', idOf(doc.member), await courseTitle(req, doc.course))
  return doc
}

export const caseActivity: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create' || doc.status !== 'submitted') return doc
  const email = doc.submittedBy?.email
  const m = email
    ? await req.payload.find({ collection: 'members', where: { email: { equals: email } }, limit: 1, depth: 0, req }).catch(() => null)
    : null
  await record(req, 'case-submitted', m?.docs[0]?.id, doc.title)
  return doc
}

export const membershipActivity: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation === 'create') await record(req, 'membership', idOf(doc.member), doc.tier)
  return doc
}
