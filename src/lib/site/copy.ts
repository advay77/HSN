import 'server-only'

import { headers } from 'next/headers'

import { getPayloadClient } from '@/lib/payload'
import { SITE_COPY, SITE_FONTS, type CompareRow, type ServiceLine, type SiteCopy, type SiteDesign, type TierCopy } from '@/lib/site/copy-defaults'

export type { CompareRow, FooterCopy, NavCopy, PrivacyCopy, ServiceLine, SiteCopy, SiteDesign, TierCopy } from '@/lib/site/copy-defaults'
export { SITE_COPY } from '@/lib/site/copy-defaults'
const TEXT_KEYS = [
  'homeTitle', 'homeSubtitle', 'homeLead', 'communityTitle', 'communityText', 'goalTitle', 'goalText',
  'partnersIntro', 'coursesTitle', 'libraryTitle', 'libraryIntro', 'involvedTitle', 'involvedIntro',
  'contactTitle', 'contactIntro', 'membershipTitle', 'membershipIntro', 'involvedPros', 'involvedHospitals', 'involvedResearchers', 'advisoryTitle', 'teamPageTitle',
  'submitTitle', 'feedbackTitle', 'feedbackIntro', 'footerTagline',
  'membershipCompareTitle', 'membershipNote', 'membershipPriceSoon', 'membershipCta', 'membershipCtaLive',
  'membershipTiersHeading', 'membershipRegion', 'membershipPrices', 'membershipPerYear', 'membershipBenefit',
  'contactEmailLabel', 'feedbackTab', 'involvedJumpPros', 'involvedJumpHospitals', 'involvedJumpResearchers',
] as const

const fillText = <T extends Record<string, string>>(value: unknown, fallback: T): T => {
  const out = { ...fallback }
  const row = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null
  if (!row) return out
  for (const key of Object.keys(fallback) as (keyof T)[]) {
    if (row[key as string] != null && String(row[key as string]).trim()) out[key] = String(row[key as string]) as T[keyof T]
  }
  return out
}

const tiersOf = (value: unknown): TierCopy[] => {
  if (!Array.isArray(value) || value.length === 0) return SITE_COPY.tiers.map((t) => ({ ...t }))
  return SITE_COPY.tiers.map((item, i) => {
    const row = value[i]
    if (!row || typeof row !== 'object') return { ...item }
    const typed = row as Partial<TierCopy>
    return {
      name: String(typed.name ?? '').trim() || item.name,
      tag: typed.tag == null ? item.tag : String(typed.tag),
      blurb: typed.blurb == null ? item.blurb : String(typed.blurb),
      features: typed.features == null ? item.features : String(typed.features),
    }
  })
}

const compareOf = (value: unknown): CompareRow[] => {
  if (!Array.isArray(value) || value.length === 0) return SITE_COPY.compare.map((r) => ({ ...r }))
  return SITE_COPY.compare.map((item, i) => {
    const row = value[i]
    if (!row || typeof row !== 'object') return { ...item }
    const typed = row as Partial<CompareRow>
    return {
      benefit: String(typed.benefit ?? '').trim() || item.benefit,
      student: typed.student == null ? item.student : String(typed.student),
      individual: typed.individual == null ? item.individual : String(typed.individual),
      institutional: typed.institutional == null ? item.institutional : String(typed.institutional),
    }
  })
}

const cloneCards = (rows: ServiceLine[]) => rows.map((row) => ({ ...row }))

const lines = (value: unknown, fallback: ServiceLine[]): ServiceLine[] => {
  if (!Array.isArray(value) || value.length === 0) return cloneCards(fallback)
  return fallback.map((item, i) => {
    const row = value[i]
    if (!row || typeof row !== 'object') return { ...item }
    const typed = row as { title?: unknown; summary?: unknown }
    return {
      title: typed.title == null ? item.title : String(typed.title),
      summary: typed.summary == null ? item.summary : String(typed.summary),
    }
  })
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null

const fontOk = (value: unknown) => SITE_FONTS.some((font) => font.id === value)

const designOf = (value: unknown): SiteDesign => {
  const row = asRecord(value)
  const pages: Record<string, string> = {}
  const saved = asRecord(row?.pages)
  if (saved) for (const [key, font] of Object.entries(saved)) if (fontOk(font)) pages[key] = String(font)
  const gap = Number(row?.gap)
  return {
    body: fontOk(row?.body) ? String(row?.body) : SITE_COPY.design.body,
    heading: fontOk(row?.heading) ? String(row?.heading) : SITE_COPY.design.heading,
    gap: Number.isFinite(gap) ? Math.min(140, Math.max(56, Math.round(gap))) : SITE_COPY.design.gap,
    pages,
  }
}

export async function getSiteCopy(): Promise<SiteCopy & { id: number | null }> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'site-copy', limit: 1, depth: 0, sort: 'id' })
  const doc = docs[0]
  const requestHeaders = await headers()
  const fresh = (): SiteCopy & { id: number | null } => ({
    ...SITE_COPY,
    focus: cloneCards(SITE_COPY.focus),
    partners: cloneCards(SITE_COPY.partners),
    services: cloneCards(SITE_COPY.services),
    involved: cloneCards(SITE_COPY.involved),
    involvedButtons: [...SITE_COPY.involvedButtons],
    privacy: { ...SITE_COPY.privacy },
    nav: { ...SITE_COPY.nav },
    footer: { ...SITE_COPY.footer },
    tiers: SITE_COPY.tiers.map((t) => ({ ...t })),
    compare: SITE_COPY.compare.map((r) => ({ ...r })),
    design: { ...SITE_COPY.design, pages: { ...SITE_COPY.design.pages } },
    id: null,
  })
  if (!doc) return fresh()
  const stored = asRecord(doc.pages)
  const preview = requestHeaders.get('x-hsn-preview') === '1' ? asRecord(stored?.preview) : null
  const source = preview ? { ...doc, ...preview } : doc
  const pages = preview ? asRecord(preview.pages) : stored
  const text = (key: (typeof TEXT_KEYS)[number]) => (pages && key in pages && pages[key] != null ? String(pages[key]) : SITE_COPY[key])
  const copy = fresh()
  copy.id = doc.id
  copy.aboutIntro = String(source.aboutIntro ?? '')
  copy.mission = String(source.mission ?? '')
  copy.purpose = String(source.purpose ?? '')
  copy.story = String(source.story ?? '')
  copy.team = String(source.team ?? '')
  copy.services = lines(source.services, SITE_COPY.services)
  copy.caseStudiesTitle = String(source.caseStudiesTitle || SITE_COPY.caseStudiesTitle)
  copy.caseStudiesMenu = String(source.caseStudiesMenu || SITE_COPY.caseStudiesMenu)
  copy.caseStudiesIntro = String(source.caseStudiesIntro ?? '')
  for (const key of TEXT_KEYS) copy[key] = text(key)
  copy.focus = lines(pages?.focus, SITE_COPY.focus)
  copy.partners = lines(pages?.partners, SITE_COPY.partners)
  copy.involved = lines(pages?.involved, SITE_COPY.involved)
  copy.involvedButtons = Array.isArray(pages?.involvedButtons)
    ? SITE_COPY.involvedButtons.map((item, i) => {
        const value = (pages.involvedButtons as unknown[])[i]
        return value != null && String(value).trim() ? String(value) : item
      })
    : [...SITE_COPY.involvedButtons]
  copy.privacy = fillText(pages?.privacy, SITE_COPY.privacy)
  copy.nav = fillText(pages?.nav, SITE_COPY.nav)
  copy.footer = fillText(pages?.footer, SITE_COPY.footer)
  copy.tiers = tiersOf(pages?.tiers)
  copy.compare = compareOf(pages?.compare)
  copy.design = designOf(pages?.design)
  return copy
}

/** Columns plus the JSON blob saved for the rest of the pages. */
export function siteCopyData(input: SiteCopy) {
  const pages: Record<string, unknown> = {}
  for (const key of TEXT_KEYS) pages[key] = input[key]
  pages.focus = input.focus
  pages.partners = input.partners
  pages.involved = input.involved
  pages.involvedButtons = input.involvedButtons
  pages.privacy = input.privacy
  pages.nav = input.nav
  pages.footer = input.footer
  pages.tiers = input.tiers
  pages.compare = input.compare
  pages.design = input.design
  return {
    aboutIntro: input.aboutIntro,
    mission: input.mission,
    purpose: input.purpose,
    story: input.story,
    team: input.team,
    services: input.services,
    caseStudiesTitle: input.caseStudiesTitle,
    caseStudiesMenu: input.caseStudiesMenu,
    caseStudiesIntro: input.caseStudiesIntro,
    pages,
  }
}
