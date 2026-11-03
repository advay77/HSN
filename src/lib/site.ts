// Site-wide settings. Social links come from env so the real URLs can be set without a code change.
// Instagram and Facebook icons only show once their link is set (no placeholder pages).
export const SOCIAL = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://chat.whatsapp.com/HSN-GROUP-INVITE',
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://www.linkedin.com/company/HSN-PAGE',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
}

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hsn.community.admin@gmail.com'

export const SITE_NAME = 'Healthcare Sustainability Network'
