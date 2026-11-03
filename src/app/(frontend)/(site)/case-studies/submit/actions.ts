'use server'

import { CASE_CATEGORIES, CASE_REGIONS } from '@/collections/CaseStudies'
import { toSlug } from '@/collections/fields/slug'
import { getPayloadClient } from '@/lib/payload'
import { rateLimit, TOO_MANY } from '@/lib/rate-limit'
import { TURNSTILE_FAILED, verifyTurnstile } from '@/lib/turnstile'
import { PURPOSE_LIMITS, readUpload, type ReadUpload } from '@/lib/uploads/server'

export type SubmitCaseState = {
  ok: boolean
  errors: Record<string, string>
}

const UNITS: Record<string, { suffix: string; label: string }> = {
  'tCO2e saved per year': { suffix: ' tCO2e', label: 'saved per year' },
  'kWh saved per year': { suffix: ' kWh', label: 'saved per year' },
  'kg waste diverted': { suffix: ' kg', label: 'waste diverted' },
  'Cost saved per year': { suffix: '', label: 'cost saved per year' },
}
const COUNTRIES = ['India', 'UAE', 'Saudi Arabia', 'Oman', 'Qatar', 'Kuwait', 'Bahrain', 'International']
const FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

// Identifies PDF / JPEG / PNG from the first bytes of the file.
function sniffType(b: Uint8Array): string | null {
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return 'application/pdf'
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png'
  return null
}

export async function submitCaseStudy(_prev: SubmitCaseState, form: FormData): Promise<SubmitCaseState> {
  if (!(await rateLimit('case-submit', 5, 60 * 60))) return { ok: false, errors: { form: TOO_MANY } }
  if (!(await verifyTurnstile(form.get('cf-turnstile-response')))) return { ok: false, errors: { form: TURNSTILE_FAILED } }
  const s = (k: string) => String(form.get(k) ?? '').trim()
  const errors: Record<string, string> = {}

  const name = s('name')
  const email = s('email')
  const organization = s('organization')
  const country = s('country')
  const title = s('title')
  const category = s('category')
  const region = s('region')
  const summary = s('summary')
  const patientSafety = s('patientSafety')

  if (!name) errors.name = 'Enter your full name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address, like name@hospital.org.'
  if (!organization) errors.organization = 'Enter your organization or hospital name.'
  if (!COUNTRIES.includes(country)) errors.country = 'Select your country.'
  if (!title) errors.title = 'Enter a project title.'
  if (!(CASE_CATEGORIES as readonly string[]).includes(category)) errors.category = 'Select a category.'
  if (!(CASE_REGIONS as readonly string[]).includes(region)) errors.region = 'Select a region.'
  if (!summary) errors.summary = 'Describe your project.'
  else if (summary.length > 1000) errors.summary = `Keep the summary to 1,000 characters (now ${summary.length}).`
  if (form.get('permission') !== 'on') errors.permission = 'Confirm you have permission to share this project.'
  if (form.get('noPatientData') !== 'on') errors.noPatientData = 'Confirm the submission has no patient-identifiable information.'

  const values = form.getAll('measureValue').map((v) => String(v).trim())
  const units = form.getAll('measureUnit').map((v) => String(v))
  const impacts = values
    .map((v, i) => ({ v, u: UNITS[units[i] ?? ''] }))
    .filter((m) => m.v !== '')
  if (impacts.length === 0) errors.measures = 'Add at least one measured result.'
  else if (impacts.some((m) => !m.u || !/^[\d.,\s]+$/.test(m.v))) errors.measures = 'Use numbers only for each measured value, e.g. 120.'

  // Attachments arrive as Files (development) or "incoming:<path>" uploaded straight to storage (production).
  const entries = form.getAll('attachments').filter((f) => (typeof f === 'string' ? f !== '' : f.size > 0))
  const files: ReadUpload[] = []
  if (entries.length > 5) errors.attachments = 'Attach up to 5 files.'
  else {
    try {
      for (const e of entries) {
        const f = await readUpload(e, PURPOSE_LIMITS['case-attachment'])
        if (f) files.push(f)
      }
    } catch {
      errors.attachments = 'Each file must be 10 MB or smaller.'
    }
    // The real file content decides the type, not what the browser claims.
    for (const f of files) {
      const type = sniffType(new Uint8Array(f.data.subarray(0, 8)))
      if (!type || !FILE_TYPES.includes(type)) {
        errors.attachments = 'Attach PDF, JPG or PNG files only.'
        break
      }
      f.type = type
    }
  }
  if (Object.keys(errors).length) return { ok: false, errors }

  const payload = await getPayloadClient()
  const attachmentIds: (number | string)[] = []
  for (const f of files) {
    const doc = await payload.create({
      collection: 'media',
      data: { alt: `Case study attachment: ${title}`, private: true },
      file: { data: f.data, mimetype: f.type, name: f.name, size: f.size },
    })
    attachmentIds.push(doc.id)
  }

  await payload.create({
    collection: 'case-studies',
    data: {
      title,
      // Unique even when two people send the same title; the admin can tidy it before publishing.
      slug: `${toSlug(title)}-${Date.now().toString(36)}`,
      status: 'submitted',
      category: category as (typeof CASE_CATEGORIES)[number],
      region: region as (typeof CASE_REGIONS)[number],
      country,
      organization,
      summary,
      patientSafety: patientSafety || undefined,
      impacts: impacts.map((m) => ({ value: `${m.v}${m.u!.suffix}`, label: m.u!.label })),
      submittedBy: { name, email, attachments: attachmentIds as number[] },
    },
  })

  return { ok: true, errors: {} }
}
