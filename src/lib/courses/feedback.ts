// Wording from the Course Completion Delegate Feedback Form.

export const SATISFACTION = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'average', label: 'Average' },
  { value: 'below-average', label: 'Below Average' },
  { value: 'poor', label: 'Poor' },
] as const

export const RECOMMEND = [
  { value: 'yes', label: 'Yes, definitely' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'no', label: 'No' },
] as const

export const CONTENT_RATINGS = [
  { key: 'objectivesClear', label: 'The learning objectives were clear and met.' },
  { key: 'contentRelevant', label: 'The course content was relevant to my professional role.' },
  { key: 'structuredLogically', label: 'The topics were structured logically and easy to follow.' },
  { key: 'lengthPace', label: 'The course length and pace were appropriate.' },
  { key: 'examplesHelpful', label: 'Practical examples/case studies were helpful.' },
] as const

export const PLATFORM_RATINGS = [
  { key: 'platformEasy', label: 'The online platform was user-friendly and easy to navigate.' },
  { key: 'mediaClear', label: 'Video quality, audio, and visual materials were clear.' },
  { key: 'quizzesHelpful', label: 'Quizzes/knowledge checks reinforced my learning.' },
] as const

export const RATINGS = [...CONTENT_RATINGS, ...PLATFORM_RATINGS]

export type RatingKey = (typeof RATINGS)[number]['key']
export type Satisfaction = (typeof SATISFACTION)[number]['value']
export type Recommend = (typeof RECOMMEND)[number]['value']

export const labelOf = (list: readonly { value: string; label: string }[], value: string | null | undefined) =>
  list.find((item) => item.value === value)?.label || '—'
