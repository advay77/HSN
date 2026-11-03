import 'server-only'

import type { CaseForm } from './actions'
import type { CaseStudy, Media } from '@/payload-types'

const m = (x: unknown): Media | null => (x && typeof x === 'object' ? (x as Media) : null)
export const currentFile = (x: unknown) => {
  const doc = m(x)
  return doc?.url ? { name: doc.filename || 'File', url: `/admin/files/${doc.id}`, isImage: !!doc.mimeType?.startsWith('image/') } : null
}

// Turns a case study (depth 1) into the editor's form state.
export function toForm(cs: CaseStudy): CaseForm {
  const attachments = (Array.isArray(cs.submittedBy?.attachments) ? cs.submittedBy!.attachments : [])
    .map((a) => (typeof a === 'object' && a ? Number(a.id) : Number(a)))
    .filter((n) => Number.isFinite(n))
  return {
    title: cs.title,
    slug: cs.slug || '',
    status: cs.status,
    category: cs.category,
    region: cs.region || '',
    country: cs.country || '',
    organization: cs.organization || '',
    color: cs.color || '#134E5E',
    summary: cs.summary,
    impacts: (cs.impacts ?? []).map((i) => ({ value: i.value, label: i.label, note: i.note || '' })),
    sections: (cs.sections ?? []).map((s) => ({
      heading: s.heading,
      lead: s.lead || '',
      body: s.body || '',
      bullets: (s.bullets ?? []).map((b) => b.text),
      tableRows: (s.tableRows ?? []).map((r) => ({ dimension: r.dimension, measure: r.measure, result: r.result })),
    })),
    imageId: m(cs.image) ? Number(m(cs.image)!.id) : typeof cs.image === 'number' ? cs.image : null,
    imageCaption: cs.imageCaption || '',
    lessons: (cs.lessons ?? []).map((l) => ({ title: l.title, text: l.text })),
    patientSafety: cs.patientSafety || '',
    pdfId: m(cs.pdf) ? Number(m(cs.pdf)!.id) : typeof cs.pdf === 'number' ? cs.pdf : null,
    submittedBy: {
      name: cs.submittedBy?.name || '',
      email: cs.submittedBy?.email || '',
      role: cs.submittedBy?.role || '',
      attachmentIds: attachments,
    },
    reviewNote: cs.reviewNote || '',
  }
}

export const attachmentsOf = (cs: CaseStudy) =>
  (Array.isArray(cs.submittedBy?.attachments) ? cs.submittedBy!.attachments : [])
    .map(m)
    .filter((a): a is Media => !!a?.url)
    .map((a) => ({ id: Number(a.id), name: a.filename || 'Attachment', url: `/admin/files/${a.id}` }))
