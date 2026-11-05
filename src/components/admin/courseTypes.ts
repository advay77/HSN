// Shapes used by the admin course editor (client) and its server actions. The editor works on these
// plain objects; src/lib/admin/courses.ts converts them to and from the `courses` collection.

/** Stored lesson kinds. The editor groups the slide-like ones under "Slide". */
export type LessonKind = 'cover' | 'text' | 'reflection' | 'diagram' | 'video' | 'references' | 'document' | 'summary' | 'quiz'
export type LessonType = 'Slide' | 'Video' | 'Reading' | 'Document' | 'Quiz'
export type CourseAccess = 'open' | 'paid'

export type EditorQuestion = { q: string; o: string[]; a: number }
export type EditorRef = { text: string; url: string; linkText?: string | null }

export type EditorLesson = {
  id?: string | null
  kind: LessonKind
  title: string
  body: string
  extra?: string | null
  video: string
  image?: { id: number; url: string; name: string } | null
  /** Word, PDF, or similar file attached to a tutorial lesson. */
  file?: { id: number; url: string; name: string } | null
  refs: EditorRef[]
  /** Raw text of the Reading box while it is being edited (one reference per line); parsed on save. */
  readingText?: string
  qs: EditorQuestion[]
  draftQuestions?: boolean | null
}

export type ModuleStatus = 'Available' | 'Coming soon' | 'Hidden'

export type EditorModule = {
  id?: string | null
  title: string
  status: ModuleStatus
  slidesId?: number | null
  lessons: EditorLesson[]
}

export type Retakes = 'Unlimited' | '3 attempts' | '1 attempt'

export type EditorCourse = {
  id: number | null
  title: string
  desc: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  kind: 'Full course' | 'Micro-course'
  by: string
  access: CourseAccess
  tagRegistration: boolean
  tagSelf: boolean
  tagVideo: boolean
  cover: { id: number; url: string; name: string } | null
  coverBadge: string
  duration: string
  language: string
  languageNote: string
  learnIntro: string
  outcomes: string
  skills: string[]
  aboutLead: string
  aboutBody: string
  certOn: boolean
  certTitle: string
  certText: string
  certStep1: string
  certStep2: string
  certStep3: string
  certPass: number // percent
  certRetakes: Retakes
  certIssuer: string
  published: boolean
  featured: boolean
  visibility: 'Everyone' | 'Members only'
  slug: string
  modules: EditorModule[]
}

export type CourseRow = {
  id: number
  title: string
  level: string
  modules: string
  published: boolean
  learners: number
  updated: string
}

/** Reading box text ↔ references: one per line, a link at the end of the line becomes its URL. */
export const refsToText = (refs: EditorRef[]) => refs.map((r) => (r.url ? `${r.text} ${r.url}` : r.text)).join('\n')
export const textToRefs = (text: string, old: EditorRef[] = []): EditorRef[] =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const url = line.match(/https?:\/\/\S+$/)?.[0] ?? ''
      const t = url ? line.slice(0, -url.length).trim() : line
      return { text: t || url, url, linkText: old[i]?.linkText ?? null }
    })

export const typeOfKind = (k: LessonKind): LessonType =>
  k === 'video' ? 'Video' : k === 'references' ? 'Reading' : k === 'document' ? 'Document' : k === 'quiz' ? 'Quiz' : 'Slide'

export const CERT_DEFAULTS = {
  title: 'Earn Your HSN Certificate',
  text: 'Receive a Healthcare Sustainability Network certificate when you finish the course. Add it to your CV and LinkedIn profile to show your commitment to sustainable, high-quality care.',
  step1: 'Complete every lesson',
  step2: 'Pass each module quiz',
  step3: 'Download and share',
  issuer: 'Healthcare Sustainability Network',
}

export const blankCourse = (): EditorCourse => ({
  id: null,
  title: '',
  desc: '',
  level: 'Beginner',
  kind: 'Full course',
  by: 'Healthcare Sustainability Network',
  access: 'open',
  tagRegistration: true,
  tagSelf: true,
  tagVideo: false,
  cover: null,
  coverBadge: '',
  duration: '',
  language: 'English',
  languageNote: '',
  learnIntro: '',
  outcomes: '',
  skills: [],
  aboutLead: '',
  aboutBody: '',
  certOn: true,
  certTitle: CERT_DEFAULTS.title,
  certText: CERT_DEFAULTS.text,
  certStep1: CERT_DEFAULTS.step1,
  certStep2: CERT_DEFAULTS.step2,
  certStep3: CERT_DEFAULTS.step3,
  certPass: 80,
  certRetakes: 'Unlimited',
  certIssuer: CERT_DEFAULTS.issuer,
  published: false,
  featured: false,
  visibility: 'Everyone',
  slug: '',
  modules: [],
})
