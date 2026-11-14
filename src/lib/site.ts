// Site-wide settings. WhatsApp, Instagram and Facebook come from env. LinkedIn is the HSN page.
// Instagram and Facebook icons only show once their link is set (no placeholder pages).
export const SOCIAL = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://chat.whatsapp.com/HSN-GROUP-INVITE',
  linkedin: 'https://www.linkedin.com/in/healthcare-sustainability-network-39684544b',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
}

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hsn.community.admin@gmail.com'

export const SITE_NAME = 'Healthcare Sustainability Network'
