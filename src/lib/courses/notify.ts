import 'server-only'

import nodemailer from 'nodemailer'

// Course registration confirmation. Returns false (and sends nothing) when SMTP is not configured,
// so the Register page only says "We've sent a confirmation" when one was really sent.
export async function sendRegistrationEmail(o: { to: string; name: string; course: string; session: string }): Promise<boolean> {
  if (!process.env.SMTP_HOST || !process.env.EMAIL_FROM) return false
  const port = Number(process.env.SMTP_PORT || 587)
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })
  const session = o.session ? `\nSession: ${o.session}` : ''
  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to: o.to,
    subject: `You're registered: ${o.course}`,
    text: `Dear ${o.name},\n\nThank you for registering for ${o.course} with the Healthcare Sustainability Network.${session}\n\nJoining instructions will arrive by email before the session.\n\nHealthcare Sustainability Network`,
  })
  return true
}
