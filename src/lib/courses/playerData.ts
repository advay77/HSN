import 'server-only'

import type { Course } from '@/payload-types'
import type { PlayerLesson, PlayerModule } from '@/components/courses/Player'
import { introLesson, isQuiz, type Lesson, media, passNeeded, playerKind, type QuizResult, visibleModules, youtubeId } from '@/lib/courses/data'

/** Turns a course into the modules the lesson player shows.
 *  - Learners: only "Available" modules have lessons; quiz answers are sent only for quizzes they already passed.
 *  - Admin preview: every visible module is open and every answer is sent, so nothing is locked. */
export function buildPlayerModules(course: Course, opts: { results: Record<string, QuizResult>; preview?: boolean }): PlayerModule[] {
  const { results, preview = false } = opts
  const toPlayer = (l: Lesson): PlayerLesson => {
    const img = media(l.image)
    const file = media(l.file)
    const reveal = preview || (isQuiz(l) && !!results[l.id!]?.passed)
    return {
      id: l.id!,
      type: l.type,
      title: l.title,
      kind: playerKind(l),
      body: l.body ?? '',
      extra: l.extra ?? '',
      image: img?.url ? { url: img.url, alt: img.alt || '' } : null,
      file: file?.url ? { url: file.url, name: file.filename || 'Tutorial', pdf: file.mimeType === 'application/pdf' || /\.pdf$/i.test(file.filename || ''), video: !!file.mimeType?.startsWith('video/') } : null,
      youtube: youtubeId(l.youtubeId),
      references: (l.references ?? []).map((r) => ({ text: r.text, url: r.url ?? '', linkText: r.linkText ?? '' })),
      draft: !!l.draftQuestions,
      questions: (l.questions ?? []).map((q) => ({
        q: q.question,
        o: (q.options ?? []).map((o) => o.text),
        a: reveal ? Math.max(0, (q.options ?? []).findIndex((o) => o.correct)) : null,
      })),
      need: isQuiz(l) ? passNeeded(course, l.questions?.length ?? 0) : 0,
    }
  }

  const modules: PlayerModule[] = visibleModules(course).map((m, i) => {
    const open = preview || m.status === 'available'
    return {
      n: i + 1,
      title: m.title,
      status: open ? 'available' : 'coming-soon',
      slides: (() => {
        const f = media(m.slides)
        if (!f?.url) return null
        const ext = (f.filename?.split('.').pop() || 'file').toUpperCase()
        const size = f.filesize ? ` · ${(f.filesize / 1024 / 1024).toFixed(1)} MB` : ''
        return { url: f.url, label: `${ext}${size}` }
      })(),
      lessons: open ? (m.lessons ?? []).map(toPlayer) : [],
    }
  })

  // The course introduction comes first, before Module 1 (shown as step 0 in the outline).
  const intro = introLesson(course)
  if (intro) modules.unshift({ n: 0, title: intro.title, status: 'available', slides: null, lessons: [{ ...toPlayer(intro), kind: intro.type === 'video' ? 'Introduction · Video' : 'Introduction' }] })
  return modules
}
