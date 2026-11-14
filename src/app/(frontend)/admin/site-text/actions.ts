'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/admin/auth'
import { getPayloadClient } from '@/lib/payload'
import { getSiteCopy, siteCopyData, SITE_COPY, type ServiceLine, type SiteCopy } from '@/lib/site/copy'

const clean = (s: string, max = 20000) => (s ?? '').replace(/\r\n/g, '\n').trim().slice(0, max)

const cards = (rows: ServiceLine[] | undefined, count: number): ServiceLine[] =>
  Array.from({ length: count }, (_, i) => ({ title: clean(rows?.[i]?.title ?? '', 300), summary: clean(rows?.[i]?.summary ?? '', 2000) }))

export async function saveSiteTextAction(input: SiteCopy): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin('/admin/site-text')
  const data = siteCopyData({
    ...input,
    aboutIntro: clean(input.aboutIntro),
    mission: clean(input.mission),
    purpose: clean(input.purpose),
    story: clean(input.story).replace(/\n{3,}/g, '\n\n'),
    team: clean(input.team),
    services: cards(input.services, SITE_COPY.services.length),
    focus: cards(input.focus, SITE_COPY.focus.length),
    partners: cards(input.partners, SITE_COPY.partners.length),
    involved: cards(input.involved, SITE_COPY.involved.length),
    caseStudiesTitle: clean(input.caseStudiesTitle, 120) || SITE_COPY.caseStudiesTitle,
    caseStudiesMenu: clean(input.caseStudiesMenu, 80) || SITE_COPY.caseStudiesMenu,
    caseStudiesIntro: clean(input.caseStudiesIntro),
    homeTitle: clean(input.homeTitle, 160),
    homeSubtitle: clean(input.homeSubtitle, 240),
    homeLead: clean(input.homeLead),
    communityTitle: clean(input.communityTitle, 80),
    communityText: clean(input.communityText),
    goalTitle: clean(input.goalTitle, 80),
    goalText: clean(input.goalText),
    partnersIntro: clean(input.partnersIntro),
    coursesTitle: clean(input.coursesTitle, 80) || SITE_COPY.coursesTitle,
    libraryTitle: clean(input.libraryTitle, 80) || SITE_COPY.libraryTitle,
    libraryIntro: clean(input.libraryIntro),
    involvedTitle: clean(input.involvedTitle, 80) || SITE_COPY.involvedTitle,
    involvedIntro: clean(input.involvedIntro),
    involvedPros: clean(input.involvedPros, 120),
    involvedHospitals: clean(input.involvedHospitals, 120),
    involvedResearchers: clean(input.involvedResearchers, 120),
    contactTitle: clean(input.contactTitle, 80) || SITE_COPY.contactTitle,
    contactIntro: clean(input.contactIntro),
    membershipTitle: clean(input.membershipTitle, 80) || SITE_COPY.membershipTitle,
    membershipIntro: clean(input.membershipIntro),
    advisoryTitle: clean(input.advisoryTitle, 80) || SITE_COPY.advisoryTitle,
    teamPageTitle: clean(input.teamPageTitle, 80) || SITE_COPY.teamPageTitle,
    submitTitle: clean(input.submitTitle, 120) || SITE_COPY.submitTitle,
    feedbackTitle: clean(input.feedbackTitle, 120) || SITE_COPY.feedbackTitle,
    feedbackIntro: clean(input.feedbackIntro),
    footerTagline: clean(input.footerTagline, 200),
    membershipCompareTitle: clean(input.membershipCompareTitle, 80) || SITE_COPY.membershipCompareTitle,
    membershipNote: clean(input.membershipNote),
    membershipPriceSoon: clean(input.membershipPriceSoon, 80) || SITE_COPY.membershipPriceSoon,
    membershipCta: clean(input.membershipCta, 80) || SITE_COPY.membershipCta,
    membershipCtaLive: clean(input.membershipCtaLive, 80) || SITE_COPY.membershipCtaLive,
    membershipTiersHeading: clean(input.membershipTiersHeading, 80) || SITE_COPY.membershipTiersHeading,
    membershipRegion: clean(input.membershipRegion, 80) || SITE_COPY.membershipRegion,
    membershipPrices: clean(input.membershipPrices, 240) || SITE_COPY.membershipPrices,
    membershipPerYear: clean(input.membershipPerYear, 40) || SITE_COPY.membershipPerYear,
    membershipBenefit: clean(input.membershipBenefit, 80) || SITE_COPY.membershipBenefit,
    contactEmailLabel: clean(input.contactEmailLabel, 80) || SITE_COPY.contactEmailLabel,
    feedbackTab: clean(input.feedbackTab, 40) || SITE_COPY.feedbackTab,
    involvedJumpPros: clean(input.involvedJumpPros, 80) || SITE_COPY.involvedJumpPros,
    involvedJumpHospitals: clean(input.involvedJumpHospitals, 80) || SITE_COPY.involvedJumpHospitals,
    involvedJumpResearchers: clean(input.involvedJumpResearchers, 80) || SITE_COPY.involvedJumpResearchers,
    involvedButtons: SITE_COPY.involvedButtons.map((item, i) => clean(input.involvedButtons?.[i] ?? '', 120) || item),
    privacy: Object.fromEntries(Object.keys(SITE_COPY.privacy).map((key) => [key, clean(input.privacy?.[key as keyof typeof SITE_COPY.privacy] ?? '', 4000) || SITE_COPY.privacy[key as keyof typeof SITE_COPY.privacy]])) as SiteCopy['privacy'],
    nav: Object.fromEntries(Object.keys(SITE_COPY.nav).map((key) => [key, clean(input.nav?.[key as keyof typeof SITE_COPY.nav] ?? '', 160) || SITE_COPY.nav[key as keyof typeof SITE_COPY.nav]])) as SiteCopy['nav'],
    footer: Object.fromEntries(Object.keys(SITE_COPY.footer).map((key) => [key, clean(input.footer?.[key as keyof typeof SITE_COPY.footer] ?? '', 160) || SITE_COPY.footer[key as keyof typeof SITE_COPY.footer]])) as SiteCopy['footer'],
    tiers: SITE_COPY.tiers.map((_, i) => ({
      name: clean(input.tiers?.[i]?.name ?? '', 80) || SITE_COPY.tiers[i]!.name,
      tag: clean(input.tiers?.[i]?.tag ?? '', 80),
      blurb: clean(input.tiers?.[i]?.blurb ?? '', 400),
      features: clean(input.tiers?.[i]?.features ?? '', 2000),
    })),
    compare: SITE_COPY.compare.map((row, i) => ({
      benefit: clean(input.compare?.[i]?.benefit ?? '', 120) || row.benefit,
      student: clean(input.compare?.[i]?.student ?? '', 160),
      individual: clean(input.compare?.[i]?.individual ?? '', 160),
      institutional: clean(input.compare?.[i]?.institutional ?? '', 200),
    })),
  })
  const payload = await getPayloadClient()
  try {
    const current = await getSiteCopy()
    if (current.id) await payload.update({ collection: 'site-copy', id: current.id, data })
    else await payload.create({ collection: 'site-copy', data })
  } catch {
    return { ok: false, error: 'The text could not be saved. Please try again.' }
  }
  for (const path of ['/', '/about', '/services', '/courses', '/case-studies', '/case-studies/submit', '/library', '/get-involved', '/contact', '/membership', '/advisory', '/founder', '/feedback', '/privacy']) {
    revalidatePath(path)
  }
  revalidatePath('/', 'layout')
  return { ok: true }
}
