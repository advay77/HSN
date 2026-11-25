export type WebinarRole = 'moderator' | 'speaker'

export type WebinarCertificate = {
  id: number
  role: WebinarRole
  recipient: string
  webinar: string
  heldOn: string
  certificateNo: number
  rightName: string
  rightTitle: string
}

/** Webinar numbers are separate from course certificates: HSN/WEB/001/2026. */
export const formatCertificateNo = (n: number, heldOn?: string) => {
  const year = heldOn ? certificateYear(heldOn) : String(new Date().getFullYear())
  return `HSN/WEB/${String(n).padStart(3, '0')}/${year}`
}

export const roleLabel = (role: WebinarRole) => (role === 'moderator' ? 'Moderator' : 'Speaker')

export function certificateYear(heldOn: string) {
  const match = heldOn.match(/\b(20\d{2})\b/)
  return match?.[1] || String(new Date().getFullYear())
}
