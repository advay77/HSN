import 'server-only'

import nodemailer from 'nodemailer'

// Emails the submitter of a case study when it is approved, returned or rejected.
// Returns false (and sends nothing) when SMTP is not configured, so the admin queue only says
// "emailed" when an email really went out.
export async function sendCaseReviewEmail(o: {
  to: string
  name: string
  title: string
  decision: 'published' | 'returned' | 'rejected'
  note?: string | null
  url?: string
}): Promise<boolean> {
  if (!process.env.SMTP_HOST || !process.env.EMAIL_FROM) return false
  const port = Number(process.env.SMTP_PORT || 587)
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })
  const greeting = `Dear ${o.name || 'colleague'},\n\n`
  const sign = '\n\nHealthcare Sustainability Network'
  const body =
    o.decision === 'published'
      ? `Your case study "${o.title}" has been approved and published in the HSN case study repository.${o.url ? `\n\n${o.url}` : ''}`
      : o.decision === 'returned'
        ? `Thank you for submitting "${o.title}". Before we can publish it, please look at this note from the HSN team:\n\n${o.note || ''}\n\nYou can edit and resubmit it from your HSN dashboard.`
        : `Thank you for submitting "${o.title}". After review, we won’t be publishing it in the case study repository.${o.note ? `\n\n${o.note}` : ''}`
  const subject =
    o.decision === 'published'
      ? `Published: ${o.title}`
      : o.decision === 'returned'
        ? `Your case study needs a few changes: ${o.title}`
        : `Your case study submission: ${o.title}`
  await transport.sendMail({ from: process.env.EMAIL_FROM, to: o.to, subject, text: greeting + body + sign })
  return true
}
