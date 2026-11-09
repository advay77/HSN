// Questions of the website feedback form, shared by the form, the server action and the admin page.

export const OVERALL_LABELS: Record<string, string> = { '5': 'Excellent', '4': 'Good', '3': 'Okay', '2': 'Poor', '1': 'Very poor' }

export const ASPECTS = [
  { key: 'design', label: 'Look and design' },
  { key: 'navigation', label: 'Finding my way around' },
  { key: 'content', label: 'Quality of information' },
  { key: 'courses', label: 'Courses and learning' },
  { key: 'resources', label: 'Library and case studies' },
  { key: 'speed', label: 'Speed of the website' },
  { key: 'mobile', label: 'Using it on my phone' },
] as const
export type AspectKey = (typeof ASPECTS)[number]['key']

export const WANTS = [
  'More courses',
  'More case studies',
  'Webinars and live sessions',
  'Downloadable toolkits',
  'Certificates',
  'Community events',
  'Newsletter',
] as const

export const ROLES = ['Doctor or clinician', 'Nurse or allied health', 'Hospital management or administration', 'Quality, safety or sustainability lead', 'Engineer or facilities', 'Student', 'Researcher or academic', 'Other'] as const

export const SOURCES = ['Google or another search engine', 'LinkedIn', 'WhatsApp', 'A colleague or friend', 'An event or conference', 'Other'] as const
