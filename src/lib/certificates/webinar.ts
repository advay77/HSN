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

export const formatCertificateNo = (n: number) => String(n).padStart(4, '0')

export const roleLabel = (role: WebinarRole) => (role === 'moderator' ? 'Moderator' : 'Speaker')

export function certificateYear(heldOn: string) {
  const match = heldOn.match(/\b(20\d{2})\b/)
  return match?.[1] || String(new Date().getFullYear())
}
