// Demo courses so the Courses, Course and Player pages can be tried before HSN adds real ones.
// Run: npx payload run scripts/seed-demo-courses.ts   (safe to re-run: courses that already exist are skipped)
// Delete them from the admin panel (Content → Courses) when the real courses are in.
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPayload } from 'payload'

import config from '../src/payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const img = (f: string) => path.resolve(dirname, '../public/images', f)

const payload = await getPayload({ config })

async function upload(file: string, alt: string) {
  const existing = await payload.find({ collection: 'media', where: { filename: { equals: path.basename(file) } }, limit: 1 })
  if (existing.docs[0]) return existing.docs[0].id
  const doc = await payload.create({ collection: 'media', data: { alt }, filePath: file })
  return doc.id
}

async function exists(slug: string) {
  const r = await payload.find({ collection: 'courses', where: { slug: { equals: slug } }, limit: 1 })
  return !!r.docs[0]
}

const text = (title: string, body: string) => ({ type: 'text' as const, title, body })

// 1. Module 1 of the HSN course, from the client's PowerPoint (Course.dc.html + Player.dc.html).
const c1 = 'healthcare-sustainability-from-awareness-to-action'
if (await exists(c1)) {
  console.log(`skip: ${c1} already exists`)
} else {
  const banner = await upload(img('hsn-course-banner.jpg'), 'Healthcare Sustainability Network: Collaborating for a Green and Healthy Future')
  const loop = await upload(
    img('sustainability-loop.png'),
    'Loop diagram: healthy environment, population health, care demand, healthcare delivery and healthcare environmental impact, each leading to the next, around a centre of quality, resilience and equity.',
  )
  await payload.create({
    collection: 'courses',
    data: {
      title: 'Healthcare Sustainability: From Awareness to Action',
      slug: c1,
      description:
        'Learn why environmental sustainability is a healthcare issue, and how every healthcare worker can connect it with safer care, service continuity and fairer outcomes.',
      level: 'Beginner',
      kind: 'Full course',
      createdBy: 'Healthcare Sustainability Network',
      cover: banner,
      coverColor: '#134E5E',
      facts: { language: 'English', languageNote: 'Hindi and Arabic coming soon' },
      learnIntro:
        'By the end, you can explain how environmental sustainability supports health, care quality, resilience, and equity across healthcare settings.',
      outcomes: [
        'Explain why environmental sustainability is a healthcare issue',
        'Describe how healthy environments support prevention, treatment and recovery',
        'Recognize how environmental disruption changes healthcare need and strains capacity',
        'Identify where healthcare creates environmental impacts, from energy to waste',
        'Spot actions that create co-benefits for health, quality, resilience and efficiency',
        'Trace the loop between environment, population health and healthcare activity',
      ].map((t) => ({ text: t })),
      skills: ['Sustainable healthcare', 'Climate resilience', 'Patient safety', 'Health equity', 'Systems thinking'].map((label) => ({ label })),
      about:
        'Environmental sustainability is a healthcare issue because health depends on functioning environmental systems, while healthcare itself uses resources and generates environmental impacts.\n\nUnderstanding this two-way relationship helps every healthcare worker connect sustainability with safer care, service continuity, and fairer outcomes, rather than treating it as a separate facilities concern. Each module is a short set of lessons with a video, a diagram to work through, references and a five-question quiz.',
      modules: [
        {
          title: 'Why Sustainability Is a Healthcare Issue',
          status: 'available',
          lessons: [
            {
              type: 'cover',
              title: 'Why Sustainability Is a Healthcare Issue',
              body: 'Environmental sustainability is a healthcare issue because health depends on functioning environmental systems, while healthcare itself uses resources and generates environmental impacts. Understanding this two-way relationship helps every healthcare worker connect sustainability with safer care, service continuity, and fairer outcomes—not treat it as a separate facilities concern.[1, 2]',
            },
            text('Why Sustainability Matters', 'By the end, you can explain how environmental sustainability supports health, care quality, resilience, and equity across healthcare settings.'),
            text('Healthy Environments Support Health', 'Healthcare depends on clean air, safe water, stable conditions, functioning ecosystems, and reliable resources. Environmental sustainability therefore protects the foundation on which prevention, treatment, and recovery rely.'),
            text('Disruption Changes Healthcare Need', 'Environmental disruption can increase illness, interrupt services, and strain capacity. People already facing social, economic, or health disadvantages may have fewer ways to avoid harm or recover from it.'),
            text('Healthcare Also Creates Impacts', 'Healthcare affects the environment through energy and water use, medicines and equipment, supply chains, travel, and waste. Responsibility includes understanding these impacts and reducing avoidable harm without compromising patient safety.'),
            text('One Action Can Create Co-Benefits', 'Well-designed sustainability actions can support health, quality, resilience, and efficiency at the same time. Examples include reducing waste, strengthening continuity, and improving the reliability of essential services.'),
            {
              type: 'reflection',
              title: 'Make the Connection Personal',
              body: 'Ask: Where does my work depend on a healthy environment, and where might my decisions affect resources, waste, continuity, or access?',
              extra: 'This connection is the starting point for practical action.',
            },
            text('A Loop, Not a One-Way Chain', 'These relationships form a loop rather than a one-way chain. Environmental conditions influence population health and care demand; healthcare responds through its buildings, workforce, technologies, and supply chains; those activities in turn affect the environment. Sustainability means improving the whole loop while keeping quality, resilience, and equity at the center.[1, 2]'),
            { type: 'diagram', title: 'Trace the Loop', body: 'Use the loop to trace how environmental conditions, health needs, and healthcare activity influence one another.', image: loop },
            {
              type: 'video',
              title: 'Health Systems and Environmental Change',
              body: 'Watch for how health systems can protect health while preparing for environmental change and reducing their own impacts.',
              youtubeId: 'Y6ofDi1aHEw',
            },
            text('Keep This Connection in Mind', 'Sustainability is not an additional objective competing with care. When it is designed well, it helps healthcare protect health, maintain quality during disruption, use resources responsibly, and reduce unequal exposure to environmental risk.[1, 2] The separate quiz now checks how well you can apply this rationale.'),
            {
              type: 'references',
              title: 'References',
              references: [
                {
                  text: 'Gkouliaveras, V. (2025). Effects of Climate Change on Health and Health Systems: A Systematic Review of Preparedness, Resilience, and Challenges. PubMed Central (PMC).',
                  url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11855611/',
                  linkText: 'pmc.ncbi.nlm.nih.gov/articles/PMC11855611',
                },
                {
                  text: 'World Health Organization (n.d.). Building climate-resilient health systems.',
                  url: 'https://www.who.int/teams/environment-climate-change-and-health/climate-change-and-health/country-support/building-climate-resilient-health-systems',
                  linkText: 'who.int · Building climate-resilient health systems',
                },
              ],
            },
            {
              type: 'summary',
              title: 'Module 1 Complete',
              body: 'Complete the separate 5-question evaluation to verify your understanding of everyday sustainable practice principles.',
            },
            {
              type: 'quiz',
              title: 'Quiz 1',
              draftQuestions: true,
              questions: [
                { q: 'Why is environmental sustainability a healthcare issue?', o: ['It is mainly a cost-saving exercise for facilities teams', 'Health depends on functioning environmental systems, and healthcare itself uses resources and creates impacts', 'It only matters for hospitals with large buildings', 'It replaces the need for quality improvement'], a: 1 },
                { q: 'Which of these is NOT named as something healthcare depends on?', o: ['Clean air and safe water', 'Stable conditions and functioning ecosystems', 'Unlimited single-use supplies', 'Reliable resources'], a: 2 },
                { q: 'Who may have fewer ways to avoid harm from environmental disruption, or recover from it?', o: ['People already facing social, economic, or health disadvantages', 'Only people living near hospitals', 'Healthcare staff working night shifts', 'No one; disruption affects everyone equally'], a: 0 },
                { q: 'What is a co-benefit?', o: ['A cost shared between two departments', 'One action that supports health, quality, resilience, and efficiency at the same time', 'A benefit that only appears after ten years', 'A reward for completing a course'], a: 1 },
                { q: 'How is the relationship between environment, health and healthcare best described?', o: ['A one-way chain from environment to patients', 'Unrelated systems', 'A loop in which each influences the others', 'A concern for facilities teams only'], a: 2 },
              ].map((x) => ({ question: x.q, options: x.o.map((t, i) => ({ text: t, correct: i === x.a })) })),
            },
          ],
        },
        { title: 'Healthcare’s Environmental Impacts', status: 'coming-soon', lessons: [] },
      ],
      certificate: { enabled: true, passMark: 80, retakes: true, issuer: 'Healthcare Sustainability Network' },
      published: true,
      featured: true,
      audience: 'everyone',
      order: 0,
    },
  })
  console.log(`created: ${c1}`)
}

// 2. A short second demo course (title from the Courses design list); its module is "Coming soon".
const c2 = 'foundations-of-healthcare-decarbonization-climate-resilience'
if (await exists(c2)) {
  console.log(`skip: ${c2} already exists`)
} else {
  await payload.create({
    collection: 'courses',
    data: {
      title: 'Foundations of Healthcare Decarbonization & Climate Resilience',
      slug: c2,
      description: 'A short micro-course on where healthcare emissions come from and how health systems can prepare for a changing climate.',
      level: 'Beginner',
      kind: 'Micro-course',
      createdBy: 'Healthcare Sustainability Network',
      coverColor: '#0B6B3A',
      facts: { language: 'English', languageNote: 'Hindi and Arabic coming soon' },
      modules: [{ title: 'Foundations of Healthcare Decarbonization', status: 'coming-soon', lessons: [] }],
      certificate: { enabled: true, passMark: 80, retakes: true, issuer: 'Healthcare Sustainability Network' },
      published: true,
      featured: false,
      audience: 'everyone',
      order: 1,
    },
  })
  console.log(`created: ${c2}`)
}

process.exit(0)
