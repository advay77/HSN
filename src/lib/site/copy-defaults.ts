export type ServiceLine = { title: string; summary: string }
export type NavCopy = {
  home: string
  about: string
  aboutPage: string
  aboutBlurb: string
  advisory: string
  advisoryBlurb: string
  team: string
  teamBlurb: string
  courses: string
  services: string
  resources: string
  casesBlurb: string
  library: string
  libraryBlurb: string
  join: string
  whatsapp: string
  whatsappBlurb: string
  linkedin: string
  linkedinBlurb: string
  membership: string
  membershipBlurb: string
  involved: string
  involvedBlurb: string
  login: string
  myHsn: string
  dashboard: string
  logout: string
  joinShort: string
  logo1: string
  logo2: string
}
export type FooterCopy = {
  explore: string
  network: string
  support: string
  home: string
  about: string
  advisory: string
  team: string
  services: string
  courses: string
  library: string
  involved: string
  membership: string
  login: string
  accessibility: string
  feedback: string
  privacy: string
  contact: string
  copyright: string
}
export type TierCopy = { name: string; tag: string; blurb: string; features: string }
export type CompareRow = { benefit: string; student: string; individual: string; institutional: string }
export type SiteDesign = { body: string; heading: string; gap: number; pages: Record<string, string> }
export const SITE_FONTS = [
  { id: 'default', label: 'Current', stack: '"Aptos Display","Aptos","Segoe UI Variable Display","Segoe UI",Inter,system-ui,sans-serif' },
  { id: 'inter', label: 'Inter', stack: 'Inter,system-ui,sans-serif' },
  { id: 'source', label: 'Source Sans', stack: '"Source Sans 3",Inter,sans-serif' },
  { id: 'nunito', label: 'Nunito Sans', stack: '"Nunito Sans",Inter,sans-serif' },
  { id: 'manrope', label: 'Manrope', stack: 'Manrope,Inter,sans-serif' },
  { id: 'outfit', label: 'Outfit', stack: 'Outfit,Inter,sans-serif' },
  { id: 'libre', label: 'Libre Baskerville', stack: '"Libre Baskerville",Georgia,serif' },
  { id: 'lora', label: 'Lora', stack: 'Lora,Georgia,serif' },
] as const
export const fontStack = (id: string) => SITE_FONTS.find((f) => f.id === id)?.stack || SITE_FONTS[0].stack
export const pageIdFromPath = (path: string) => {
  const hit: [string, string][] = [['/about', 'about'], ['/advisory', 'advisory'], ['/founder', 'team'], ['/services', 'services'], ['/courses', 'courses'], ['/case-studies', 'cases'], ['/library', 'library'], ['/get-involved', 'involved'], ['/membership', 'membership'], ['/contact', 'contact'], ['/feedback', 'feedback'], ['/privacy', 'privacy']]
  return hit.find(([href]) => path === href || path.startsWith(href + '/'))?.[1] || 'home'
}
export type PrivacyCopy = {
  title: string
  date: string
  readTime: string
  contents: string
  lead: string
  s1: string
  s1intro: string
  c1t: string
  c1d: string
  c2t: string
  c2d: string
  c3t: string
  c3d: string
  s2: string
  s2intro: string
  s2a: string
  s2b: string
  s2c: string
  s2d: string
  s3: string
  s3note: string
  s3body: string
  s4: string
  s4body: string
  s5: string
  s5a: string
  s5ad: string
  s5b: string
  s5bd: string
  s6: string
  s6body: string
  s7: string
  s7body: string
}

export type SiteCopy = {
  homeTitle: string
  homeSubtitle: string
  homeLead: string
  focus: ServiceLine[]
  communityTitle: string
  communityText: string
  goalTitle: string
  goalText: string
  aboutIntro: string
  mission: string
  purpose: string
  story: string
  team: string
  partnersIntro: string
  partners: ServiceLine[]
  services: ServiceLine[]
  coursesTitle: string
  caseStudiesTitle: string
  caseStudiesMenu: string
  caseStudiesIntro: string
  libraryTitle: string
  libraryIntro: string
  involvedTitle: string
  involvedIntro: string
  involvedPros: string
  involvedHospitals: string
  involvedResearchers: string
  involved: ServiceLine[]
  contactTitle: string
  contactIntro: string
  membershipTitle: string
  membershipIntro: string
  advisoryTitle: string
  teamPageTitle: string
  submitTitle: string
  feedbackTitle: string
  feedbackIntro: string
  footerTagline: string
  membershipCompareTitle: string
  membershipNote: string
  membershipPriceSoon: string
  membershipCta: string
  membershipCtaLive: string
  membershipTiersHeading: string
  membershipRegion: string
  membershipPrices: string
  membershipPerYear: string
  membershipBenefit: string
  contactEmailLabel: string
  feedbackTab: string
  involvedJumpPros: string
  involvedJumpHospitals: string
  involvedJumpResearchers: string
  involvedButtons: string[]
  privacy: PrivacyCopy
  nav: NavCopy
  footer: FooterCopy
  tiers: TierCopy[]
  compare: CompareRow[]
  design: SiteDesign
}

// Words on the site until someone saves new ones in Admin → Page text.
export const SITE_COPY: SiteCopy = {
  homeTitle: 'Healthcare Sustainability Network',
  homeSubtitle: 'Advancing Sustainable Healthcare, Green Operations, and Decarbonization',
  homeLead: 'Bridging the gap between healthcare quality, patient safety, and environmental stewardship across health systems.',
  focus: [
    { title: 'Environmental Health, Safety, and Policy Standards', summary: 'Aligning clinical governance quality metrics with global and regional environmental benchmarks.' },
    { title: 'Sustainable Hospital Operations & Energy Management', summary: 'Driving energy efficiency, resource conservation, and operational resilience.' },
    { title: 'Green Procurement, Waste Reduction & Circular Economy', summary: 'Optimizing supply chains, diverting medical waste, and advancing circular resource use.' },
    { title: 'Case Studies, Research & Best Practices', summary: 'Sharing practical, field-tested evidence and scalable implementation models.' },
  ],
  communityTitle: 'Community',
  communityText: 'A dedicated collective of healthcare professionals, quality and patient safety professionals, clinicians, and health system administrators.',
  goalTitle: 'Goal',
  goalText: 'Driving measurable, low-carbon transformation across regional healthcare organizations.',
  aboutIntro: 'The Healthcare Sustainability Network (HSN) is a dedicated collective of healthcare professionals, quality managers, clinicians, and health system administrators committed to advancing sustainable practices, green operations, and decarbonization across the healthcare sector.',
  mission: 'Our mission is to bridge the gap between healthcare quality, patient safety, and environmental stewardship—empowering healthcare professionals to drive measurable, low-carbon transformation within their organizations.',
  purpose: 'Providing grounded, practical frameworks so healthcare professionals can integrate green practices into daily hospital routines without compromising patient safety or clinical outcomes.',
  story: `HSN was founded out of a clear operational realization: while sustainability is globally recognized as a priority, healthcare leaders and frontline clinical staff often lack practical, grounded frameworks to integrate green practices into daily hospital routines without compromising patient safety or clinical outcomes.

Starting as an initiative focused on bridging clinical quality governance with environmental standards—such as international accreditation guidelines and regional health directives—HSN rapidly grew into a dedicated professional network.

Today, HSN connects healthcare leaders, quality and patient safety professionals, clinical leads, facility heads, and sustainability advocates working collectively to transform health facilities across the region into sustainable centers of excellence.`,
  team: 'Our network is driven by experienced healthcare quality leaders, clinical governance specialists, environmental health advisors, and sustainability champions with deep expertise across healthcare systems.',
  partnersIntro: 'We collaborate alongside forward-thinking health organizations, accreditation partners, and academic institutions committed to sustainable healthcare transformation.',
  partners: [
    { title: 'Healthcare Delivery Partners', summary: 'Hospitals, medical centers, and outpatient networks implementing sustainability initiatives.' },
    { title: 'Quality & Accreditation Networks', summary: 'Professional health associations and quality bodies aligning patient care standards with environmental stewardship.' },
    { title: 'Knowledge & Academic Collaborators', summary: 'Technical advisors, sustainability experts, and educational facilitators contributing to evidence-based healthcare decarbonization.' },
  ],
  services: [
    { title: 'Sustainable Quality Improvement (SusQI) Advisory & Mentorship', summary: 'We help facilities embed SusQI methods into existing Quality Management Systems, clinical pathways and policy frameworks, with hands-on mentorship along the way.' },
    { title: 'Institutional Micro-Learning & Workforce Capability Building', summary: 'Interactive, bite-sized training programs, SusQI workshops, and QR-coded digital micro-learning modules for every team, from wards to the boardroom.' },
    { title: 'Environmental Health & Accreditation Readiness', summary: 'Technical guidance to meet regional sustainability targets and international environmental accreditation standards, including International Healthcare Standards such as JCI, ACHS, etc.' },
    { title: 'Sustainable Hospital Operations & Resource Optimization', summary: 'Baseline audits and carbon footprint assessments of energy, water, medical waste and facility operations to find tangible efficiency gains.' },
    { title: 'Green Procurement & Circular Economy Advisory', summary: 'Sustainable purchasing frameworks, green supply chain criteria and supplier benchmarks that lower life-cycle impacts and operational costs.' },
  ],
  coursesTitle: 'Courses',
  caseStudiesTitle: 'Case Studies/Posters',
  caseStudiesMenu: 'Case Studies & Posters',
  caseStudiesIntro: 'Real-world projects from hospitals cutting carbon, waste and cost without compromising patient safety.',
  libraryTitle: 'Library',
  libraryIntro: 'Guides, toolkits, reports and templates to help healthcare teams plan, measure and report sustainability improvements.',
  involvedTitle: 'Get Involved',
  involvedIntro: 'Whether you lead a ward, run a hospital or research healthcare decarbonization, there’s a practical way to take part.',
  involvedPros: 'Healthcare Professionals & Clinicians',
  involvedHospitals: 'Hospitals & Health Systems',
  involvedResearchers: 'Researchers & Experts',
  involved: [
    { title: 'Join the Collective', summary: 'Connect with peer clinicians, quality managers, and administrators to share real-world challenges, strategies, and solutions.' },
    { title: 'Implement a Sustainable Project', summary: 'Lead a green initiative or SusQI project in your unit using HSN templates and peer guidance.' },
    { title: 'Institutional Partnership', summary: 'Partner with HSN to train staff, benchmark sustainable operational metrics, and elevate green healthcare leadership.' },
    { title: 'Host Collaborative Workshops', summary: 'Work with HSN to run internal training sessions on sustainable waste management, energy reduction, and green procurement.' },
    { title: 'Share Best Practices & Research', summary: 'Submit case studies, research papers, and technical guides to be featured across HSN channels.' },
    { title: 'Speaking Opportunities', summary: 'Present at HSN webinars, expert panels, and technical roundtables.' },
  ],
  contactTitle: 'Contact Us',
  contactIntro: 'Questions about membership, courses, case studies or partnerships? Email the HSN team and we will get back to you.',
  membershipTitle: 'Membership',
  membershipIntro: 'Join a growing network of healthcare professionals and institutions leading sustainable care across India and the GCC.',
  advisoryTitle: 'Advisory Board',
  teamPageTitle: 'Our Team',
  submitTitle: 'Submit a Case Study / Poster',
  feedbackTitle: 'Help us improve HSN',
  feedbackIntro: 'Your feedback shapes what we build next: new courses, case studies and resources for healthcare teams. It takes about 3 minutes.',
  footerTagline: 'Collaborating for a Green and Healthy Future.',
  membershipCompareTitle: 'Compare Tiers',
  membershipNote: 'Online payment isn’t available yet. Registering interest doesn’t commit you to anything; we’ll email you when membership opens.',
  membershipPriceSoon: 'Pricing coming soon',
  membershipCta: 'Register interest',
  membershipCtaLive: 'Join and pay',
  membershipTiersHeading: 'Membership Tiers',
  membershipRegion: 'Region & currency',
  membershipPrices: 'Prices shown in {currency} for {country}. Type to search your country.',
  membershipPerYear: '/ year',
  membershipBenefit: 'Benefit',
  contactEmailLabel: 'Email Us',
  feedbackTab: 'Feedback',
  involvedJumpPros: 'Professionals & Clinicians',
  involvedJumpHospitals: 'Hospitals & Health Systems',
  involvedJumpResearchers: 'Researchers & Experts',
  involvedButtons: ['Join the community', 'Start with the SusQI course', 'See institutional membership', 'Plan a workshop', 'Submit a case study', 'Offer to speak'],
  privacy: {
    title: 'Privacy Policy',
    date: 'Effective Date: October 26, 2026',
    readTime: 'About a 4-minute read',
    contents: 'Contents',
    lead: 'At the Healthcare Sustainability Network (HSN), we respect your privacy and are committed to protecting any personal information you share with us. This Privacy Policy outlines what information we collect, how we use it, and how we keep it safe.',
    s1: '1. Information We Collect',
    s1intro: 'We may collect personal information when you interact with us, sign up for our network, or subscribe to our updates. This may include:',
    c1t: 'Contact Information',
    c1d: 'Your name, email address, and phone number.',
    c2t: 'Professional Details',
    c2d: 'Your organization, hospital, clinic, or professional role.',
    c3t: 'Communications',
    c3d: 'Messages, inquiries, or feedback you send to us.',
    s2: '2. How We Use Your Information',
    s2intro: 'We use the collected information for the following purposes:',
    s2a: 'To respond to your inquiries and communicate about HSN initiatives.',
    s2b: 'To manage network memberships, community updates, and event invitations.',
    s2c: 'To share newsletters, resources, and toolkits related to sustainable healthcare practices.',
    s2d: 'To improve our network offerings and collaboration opportunities.',
    s3: '3. How We Share Your Information',
    s3note: 'We do not sell, rent, or trade your personal information to third parties.',
    s3body: 'We may share information only with your explicit consent (e.g., connecting members within the network) or if required by law.',
    s4: '4. Data Security',
    s4body: 'We take reasonable administrative, technical, and physical measures to protect your personal information from unauthorized access, loss, misuse, or disclosure. However, no data transmission over the internet can be guaranteed 100% secure.',
    s5: '5. Your Choices and Rights',
    s5a: 'Opt-Out',
    s5ad: 'You can unsubscribe from our mailing lists or community updates at any time by replying "Unsubscribe" to any of our emails.',
    s5b: 'Access or Update',
    s5bd: 'You can request to view, update, or delete the personal information we hold about you by contacting us.',
    s6: '6. Changes to This Privacy Policy',
    s6body: 'We may update this Privacy Policy from time to time. Any changes will be posted here with an updated effective date.',
    s7: '7. Contact Us',
    s7body: 'If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:',
  },
  nav: {
    home: 'Home', about: 'About Us', aboutPage: 'About Us', aboutBlurb: 'Our Mission, Story, Team & Partners',
    advisory: 'Advisory Board', advisoryBlurb: 'Visionary Healthcare Leaders', team: 'Our Team', teamBlurb: 'The people of HSN',
    courses: 'Courses', services: 'Services', resources: 'Resources', casesBlurb: 'Real Hospital Projects',
    library: 'Library', libraryBlurb: 'Downloadable Toolkits, Guides and Documents',
    join: 'Join HSN', whatsapp: 'Join WhatsApp Group', whatsappBlurb: 'Opens WhatsApp',
    linkedin: 'Follow on LinkedIn', linkedinBlurb: 'Opens LinkedIn',
    membership: 'Membership', membershipBlurb: 'Plans and How to Join', involved: 'Get Involved', involvedBlurb: 'Ways to Take Part',
    login: 'Log in', myHsn: 'My HSN', dashboard: 'My dashboard', logout: 'Log out', joinShort: 'Join', logo1: 'HEALTHCARE', logo2: 'SUSTAINABILITY NETWORK',
  },
  footer: {
    explore: 'Explore', network: 'Network', support: 'Support',
    home: 'Home', about: 'About Us', advisory: 'Advisory Board', team: 'Our Team', services: 'Services', courses: 'Courses',
    library: 'Library', involved: 'Get Involved', membership: 'Membership', login: 'Log in',
    accessibility: 'Accessibility', feedback: 'Feedback', privacy: 'Privacy Policy', contact: 'Contact us',
    copyright: 'Healthcare Sustainability Network',
  },
  tiers: [
    { name: 'Student', tag: '', blurb: 'For students in healthcare, engineering and sustainability.', features: 'Access to the WhatsApp/LinkedIn community\nIntroductory micro-courses\nPublished case studies\nStudent badge' },
    { name: 'Individual Professional', tag: 'For practitioners', blurb: 'For clinicians, quality managers, engineers and administrators.', features: 'Everything in Student\nFull course library\nCase study submissions\nVerified HSN certificate' },
    { name: 'Institutional', tag: '', blurb: 'For hospitals and health systems training their teams.', features: 'Up to 20 staff accounts\nInstitutional recognition on the website\nGreen audit toolkits\nBenchmarking reports' },
  ],
  compare: [
    { benefit: 'WhatsApp/LinkedIn community', student: 'Included', individual: 'Included', institutional: 'Included' },
    { benefit: 'Courses', student: 'Introductory micro-courses', individual: 'Full course library', institutional: 'Full library for staff' },
    { benefit: 'Case studies', student: 'Read published', individual: 'Read and submit', institutional: 'Read and submit' },
    { benefit: 'Recognition', student: 'Student badge', individual: 'Verified HSN certificate', institutional: 'Institutional recognition on the website' },
    { benefit: 'Accounts', student: '1', individual: '1', institutional: 'Up to 20 staff accounts' },
    { benefit: 'Tools', student: '—', individual: '—', institutional: 'Green audit toolkits, benchmarking reports' },
  ],
  design: { body: 'default', heading: 'default', gap: 96, pages: {} },
}
