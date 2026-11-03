// Site-wide settings. Social links come from env so the real URLs can be set without a code change.
// TODO(client): set the real links in .env (NEXT_PUBLIC_WHATSAPP_URL etc.). Until then the design placeholders are used.
export const SOCIAL = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://chat.whatsapp.com/HSN-GROUP-INVITE',
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://www.linkedin.com/company/HSN-PAGE',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/HSN-PAGE',
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://www.facebook.com/HSN-PAGE',
}

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hsn.community.admin@gmail.com'

export const SITE_NAME = 'Healthcare Sustainability Network'
