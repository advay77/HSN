import 'server-only'

import type { Course, Media } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import {
  CERT_DEFAULTS,
  type CourseRow,
  type EditorCourse,
  type EditorLesson,
  type EditorModule,
  type ModuleStatus,
  type Retakes,
  textToRefs,
} from '@/components/admin/courseTypes'

const media = (m: unknown) => (m && typeof m === 'object' ? (m as Media) : null)
const mediaRef = (m: unknown) => {
  const x = media(m)
  return x?.url ? { id: x.id, url: x.url, name: x.filename || 'image' } : null
}

const STATUS_IN: Record<string, ModuleStatus> = { available: 'Available', 'coming-soon': 'Coming soon', hidden: 'Hidden' }
const STATUS_OUT: Record<ModuleStatus, 'available' | 'coming-soon' | 'hidden'> = {
  Available: 'available',
  'Coming soon': 'coming-soon',
  Hidden: 'hidden',
}

export function updatedLabel(iso: string, now = new Date()) {
  const d = new Date(iso)
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((day(now) - day(d)) / 86400000)
  if (diff <= 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export async function listCourses(): Promise<CourseRow[]> {
  const payload = await getPayloadClient()
  const [courses, enrollments] = await Promise.all([
    payload.find({ collection: 'courses', sort: 'order', pagination: false, depth: 0 }),
    payload.find({ collection: 'enrollments', pagination: false, depth: 0, select: { course: true } }),
  ])
  const learners = new Map<number, number>()
  for (const e of enrollments.docs) {
    const id = typeof e.course === 'object' ? e.course?.id : e.course
    if (id) learners.set(id, (learners.get(id) ?? 0) + 1)
  }
  return courses.docs.map((c) => {
    const mods = c.modules ?? []
    return {
      id: c.id,
      title: c.title,
      level: c.level,
      modules: mods.length ? `${mods.length} ${mods.length === 1 ? 'module' : 'modules'} · ${mods.filter((m) => m.status === 'available').length} live` : '—',
      published: !!c.published,
      learners: learners.get(c.id) ?? 0,
      updated: updatedLabel(c.updatedAt),
    }
  })
}

export async function getCourseForEditor(id: number): Promise<EditorCourse | null> {
  const payload = await getPayloadClient()
  const c = await payload.findByID({ collection: 'courses', id, depth: 1 }).catch(() => null)
  return c ? toEditor(c) : null
}

const retakesOf = (c: Course): Retakes =>
  c.certificate?.retakes === false ? '1 attempt' : c.certificate?.maxAttempts === 3 ? '3 attempts' : 'Unlimited'

export function toEditor(c: Course): EditorCourse {
  const about = (c.about || '').split(/\n\s*\n/)
  return {
    id: c.id,
    title: c.title,
    desc: c.description,
    level: c.level,
    kind: c.kind,
    by: c.createdBy || '',
    tagSelf: c.tagSelfPaced !== false,
    tagVideo: c.tagVideo ?? (c.modules ?? []).some((m) => (m.lessons ?? []).some((l) => l.type === 'video')),
    cover: mediaRef(c.cover),
    coverBadge: c.coverBadge ?? (c.audience === 'members' ? 'Free for members' : 'Free course'),
    duration: c.facts?.duration || '',
    language: c.facts?.language || '',
    languageNote: c.facts?.languageNote || '',
    learnIntro: c.learnIntro || '',
    outcomes: (c.outcomes ?? []).map((o) => o.text).join('\n'),
    skills: (c.skills ?? []).map((s) => s.label),
    aboutLead: (about[0] || '').trim(),
    aboutBody: about.slice(1).map((p) => p.trim()).filter(Boolean).join('\n\n'),
    certOn: c.certificate?.enabled !== false,
    certTitle: c.certificate?.heading || CERT_DEFAULTS.title,
    certText: c.certificate?.text || CERT_DEFAULTS.text,
    certStep1: c.certificate?.step1 || CERT_DEFAULTS.step1,
    certStep2: c.certificate?.step2 || CERT_DEFAULTS.step2,
    certStep3: c.certificate?.step3 || CERT_DEFAULTS.step3,
    certPass: c.certificate?.passMark ?? 80,
    certRetakes: retakesOf(c),
    certIssuer: c.certificate?.issuer || CERT_DEFAULTS.issuer,
    published: !!c.published,
    featured: !!c.featured,
    visibility: c.audience === 'members' ? 'Members only' : 'Everyone',
    slug: c.slug || '',
    modules: (c.modules ?? []).map(
      (m): EditorModule => ({
        id: m.id,
        title: m.title,
        status: STATUS_IN[m.status] ?? 'Available',
        slidesId: media(m.slides)?.id ?? (typeof m.slides === 'number' ? m.slides : null),
        lessons: (m.lessons ?? []).map(
          (l): EditorLesson => ({
            id: l.id,
            kind: l.type,
            title: l.title,
            body: l.body || '',
            extra: l.extra,
            video: l.youtubeId || '',
            image: mediaRef(l.image),
            refs: (l.references ?? []).map((r) => ({ text: r.text, url: r.url || '', linkText: r.linkText })),
            qs: (l.questions ?? []).map((q) => {
              const opts = q.options ?? []
              return { q: q.question, o: opts.map((o) => o.text), a: Math.max(0, opts.findIndex((o) => o.correct)) }
            }),
            draftQuestions: l.draftQuestions,
          }),
        ),
      }),
    ),
  }
}

const trim = (s: string | null | undefined) => (s ?? '').trim()

/** Editor state → `courses` data. Drops empty rows so required fields never fail on half-filled lines. */
export function fromEditor(e: EditorCourse) {
  const about = [trim(e.aboutLead), trim(e.aboutBody)].filter(Boolean).join('\n\n')
  const retakes = e.certRetakes
  return {
    title: trim(e.title),
    description: trim(e.desc),
    slug: trim(e.slug) || undefined,
    level: e.level,
    kind: e.kind,
    createdBy: trim(e.by),
    tagSelfPaced: e.tagSelf,
    tagVideo: e.tagVideo,
    cover: e.cover?.id ?? null,
    coverBadge: trim(e.coverBadge),
    facts: { duration: trim(e.duration), language: trim(e.language), languageNote: trim(e.languageNote) },
    learnIntro: trim(e.learnIntro),
    outcomes: e.outcomes
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text) => ({ text })),
    skills: e.skills.map((s) => s.trim()).filter(Boolean).map((label) => ({ label })),
    about,
    certificate: {
      enabled: e.certOn,
      heading: trim(e.certTitle),
      text: trim(e.certText),
      step1: trim(e.certStep1),
      step2: trim(e.certStep2),
      step3: trim(e.certStep3),
      passMark: Math.min(100, Math.max(0, Math.round(e.certPass))),
      retakes: retakes !== '1 attempt',
      maxAttempts: retakes === '3 attempts' ? 3 : retakes === '1 attempt' ? 1 : 0,
      issuer: trim(e.certIssuer),
    },
    published: e.published,
    featured: e.featured,
    audience: e.visibility === 'Members only' ? ('members' as const) : ('everyone' as const),
    modules: e.modules.map((m) => ({
      ...(m.id ? { id: m.id } : {}),
      title: trim(m.title) || 'Untitled module',
      status: STATUS_OUT[m.status] ?? 'available',
      slides: m.slidesId ?? null,
      lessons: m.lessons.map((l) => {
        // Slides with a picture are shown as diagrams in the Player; without one, as text slides.
        const slideLike = l.kind !== 'video' && l.kind !== 'references' && l.kind !== 'quiz'
        const kind = slideLike && l.kind !== 'cover' ? (l.image ? 'diagram' : l.kind === 'diagram' ? 'text' : l.kind) : l.kind
        return {
          ...(l.id ? { id: l.id } : {}),
          title: trim(l.title) || 'Untitled lesson',
          type: kind,
          body: l.body ?? '',
          extra: l.extra ?? null,
          image: slideLike ? l.image?.id ?? null : null,
          youtubeId: kind === 'video' ? trim(l.video) : null,
          references:
            kind === 'references'
              ? (l.readingText != null ? textToRefs(l.readingText, l.refs) : l.refs).filter((r) => trim(r.text)).map((r) => ({ text: trim(r.text), url: trim(r.url), linkText: r.linkText ?? null }))
              : [],
          draftQuestions: kind === 'quiz' ? !!l.draftQuestions : false,
          questions:
            kind === 'quiz'
              ? l.qs
                  .filter((q) => trim(q.q))
                  .map((q) => {
                    const opts = q.o.map((t, i) => ({ text: trim(t), correct: i === q.a })).filter((o) => o.text)
                    if (opts.length && !opts.some((o) => o.correct)) opts[0]!.correct = true
                    return { question: trim(q.q), options: opts }
                  })
              : [],
        }
      }),
    })),
  }
}
