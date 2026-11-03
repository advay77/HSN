'use server'

import { revalidatePath } from 'next/cache'

import { CASE_CATEGORIES, CASE_REGIONS } from '@/collections/CaseStudies'
import { requireAdmin } from '@/lib/admin/auth'
import { uploadToMedia } from '@/lib/admin/media'
import { sendCaseReviewEmail } from '@/lib/admin/notify'
import { getPayloadClient } from '@/lib/payload'

type Decision = 'published' | 'returned' | 'rejected'
export type DecideResult = { ok: true; emailed: boolean } | { ok: false; error: string }

const siteUrl = () => (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')

const refresh = () => {
  revalidatePath('/admin', 'layout')
  revalidatePath('/case-studies')
}

/** Approve and publish, return with a note, or reject a submitted case study. */
export async function decideCaseStudy(id: number, decision: Decision, note?: string): Promise<DecideResult> {
  await requireAdmin('/admin/case-studies')
  const text = (note ?? '').trim()
  if (decision === 'returned' && !text) return { ok: false, error: 'Write a note so the submitter knows what to change.' }
  const payload = await getPayloadClient()
  const cs = await payload.findByID({ collection: 'case-studies', id, depth: 0 }).catch(() => null)
  if (!cs) return { ok: false, error: 'This case study no longer exists.' }
  const now = new Date().toISOString()
  const updated = await payload.update({
    collection: 'case-studies',
    id,
    data: {
      status: decision,
      reviewNote: decision === 'published' ? cs.reviewNote : text || null,
      reviewedAt: now,
      ...(decision === 'published' ? { publishedAt: cs.publishedAt || now } : {}),
    },
  })
  let emailed = false
  const to = cs.submittedBy?.email
  if (to) {
    try {
      emailed = await sendCaseReviewEmail({
        to,
        name: cs.submittedBy?.name || '',
        title: cs.title,
        decision,
        note: text,
        url: decision === 'published' && siteUrl() ? `${siteUrl()}/case-studies/${updated.slug}` : undefined,
      })
    } catch (err) {
      payload.logger.error({ err }, 'Could not email case study decision')
    }
  }
  refresh()
  return { ok: true, emailed }
}

/** Puts a decided case study back in the approval queue. */
export async function undoCaseDecision(id: number): Promise<{ ok: boolean }> {
  await requireAdmin('/admin/case-studies')
  const payload = await getPayloadClient()
  await payload.update({ collection: 'case-studies', id, data: { status: 'submitted', reviewedAt: null, publishedAt: null } })
  refresh()
  return { ok: true }
}

/** Takes a published case study off the website (it becomes a draft). */
export async function unpublishCaseStudy(id: number): Promise<{ ok: boolean }> {
  await requireAdmin('/admin/case-studies')
  const payload = await getPayloadClient()
  await payload.update({ collection: 'case-studies', id, data: { status: 'draft' } })
  refresh()
  return { ok: true }
}

export async function deleteCaseStudy(id: number): Promise<{ ok: boolean }> {
  await requireAdmin('/admin/case-studies')
  const payload = await getPayloadClient()
  await payload.delete({ collection: 'case-studies', id })
  refresh()
  return { ok: true }
}

// ---------- editor ----------

export type CaseForm = {
  title: string
  slug: string
  status: 'draft' | 'submitted' | 'published' | 'returned' | 'rejected'
  category: string
  region: string
  country: string
  organization: string
  color: string
  summary: string
  impacts: { value: string; label: string; note: string }[]
  sections: {
    heading: string
    lead: string
    body: string
    bullets: string[]
    tableRows: { dimension: string; measure: string; result: string }[]
  }[]
  imageId: number | null
  imageCaption: string
  lessons: { title: string; text: string }[]
  patientSafety: string
  pdfId: number | null
  submittedBy: { name: string; email: string; role: string; attachmentIds: number[] }
  reviewNote: string
}

export type SaveResult = { ok: true; id: number; slug: string } | { ok: false; errors: Record<string, string> }

const clean = (s: unknown, max = 5000) => String(s ?? '').trim().slice(0, max)
const COLORS = ['#134E5E', '#4FAE4E', '#5BC0E3', '#0B6B3A'] as const

/** Creates or updates a case study from the admin editor. `formData` holds `data` (JSON) plus optional `image` / `pdf` files. */
export async function saveCaseStudy(id: number | null, formData: FormData): Promise<SaveResult> {
  await requireAdmin(id ? `/admin/case-studies/${id}` : '/admin/case-studies/new')
  let f: CaseForm
  try {
    f = JSON.parse(String(formData.get('data') || ''))
  } catch {
    return { ok: false, errors: { form: 'The form could not be read. Reload the page and try again.' } }
  }

  const errors: Record<string, string> = {}
  if (!clean(f.title)) errors.title = 'Enter a title.'
  if (!(CASE_CATEGORIES as readonly string[]).includes(f.category)) errors.category = 'Choose a category.'
  if (f.region && !(CASE_REGIONS as readonly string[]).includes(f.region)) errors.region = 'Choose a region.'
  if (!clean(f.summary)) errors.summary = 'Enter a short summary.'
  if (f.submittedBy?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.submittedBy.email.trim())) errors.email = 'Enter a valid email address.'
  f.impacts.forEach((imp, i) => {
    if ((imp.value || imp.label || imp.note) && (!clean(imp.value) || !clean(imp.label))) errors[`impact-${i}`] = 'Each result needs a value and a label.'
  })
  f.sections.forEach((s, i) => {
    if (!clean(s.heading)) errors[`section-${i}`] = 'Each section needs a heading.'
  })
  f.lessons.forEach((l, i) => {
    if (!clean(l.title) || !clean(l.text)) errors[`lesson-${i}`] = 'Each lesson needs a title and text.'
  })
  if (Object.keys(errors).length) return { ok: false, errors }

  const payload = await getPayloadClient()
  let imageId = f.imageId
  let pdfId = f.pdfId
  try {
    imageId = (await uploadToMedia(formData.get('image'), clean(f.imageCaption) || clean(f.title))) ?? imageId
    pdfId = (await uploadToMedia(formData.get('pdf'), clean(f.title))) ?? pdfId
  } catch (e) {
    return { ok: false, errors: { form: e instanceof Error ? e.message : 'The file could not be uploaded.' } }
  }

  const data = {
    title: clean(f.title, 300),
    slug: clean(f.slug, 120) || undefined,
    status: f.status,
    category: f.category as (typeof CASE_CATEGORIES)[number],
    region: (f.region || null) as (typeof CASE_REGIONS)[number] | null,
    country: clean(f.country, 120) || null,
    organization: clean(f.organization, 300) || null,
    color: (COLORS.includes(f.color as (typeof COLORS)[number]) ? f.color : '#134E5E') as (typeof COLORS)[number],
    summary: clean(f.summary),
    impacts: f.impacts
      .filter((i) => clean(i.value) && clean(i.label))
      .slice(0, 4)
      .map((i) => ({ value: clean(i.value, 80), label: clean(i.label, 160), note: clean(i.note, 300) || null })),
    sections: f.sections.map((s) => ({
      heading: clean(s.heading, 200),
      lead: clean(s.lead) || null,
      body: clean(s.body, 20000) || null,
      bullets: s.bullets.map((b) => clean(b, 500)).filter(Boolean).map((text) => ({ text })),
      tableRows: s.tableRows
        .filter((r) => clean(r.dimension) && clean(r.measure) && clean(r.result))
        .map((r) => ({ dimension: clean(r.dimension, 200), measure: clean(r.measure, 300), result: clean(r.result, 300) })),
    })),
    image: imageId,
    imageCaption: clean(f.imageCaption, 300) || null,
    lessons: f.lessons.map((l) => ({ title: clean(l.title, 200), text: clean(l.text) })),
    patientSafety: clean(f.patientSafety) || null,
    pdf: pdfId,
    submittedBy: {
      name: clean(f.submittedBy?.name, 200) || null,
      email: clean(f.submittedBy?.email, 200) || null,
      role: clean(f.submittedBy?.role, 200) || null,
      attachments: f.submittedBy?.attachmentIds ?? [],
    },
    reviewNote: clean(f.reviewNote) || null,
  }

  try {
    const doc = id
      ? await payload.update({ collection: 'case-studies', id, data })
      : await payload.create({ collection: 'case-studies', data })
    refresh()
    return { ok: true, id: Number(doc.id), slug: doc.slug || '' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    if (/slug|unique/i.test(msg)) return { ok: false, errors: { slug: 'Another case study already uses this web address.' } }
    payload.logger.error({ err: e }, 'Could not save case study')
    return { ok: false, errors: { form: 'The case study could not be saved. Please try again.' } }
  }
}
