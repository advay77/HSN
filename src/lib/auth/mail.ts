import 'server-only'

import nodemailer from 'nodemailer'

const smtpConfigured = () => Boolean(process.env.SMTP_HOST && process.env.EMAIL_FROM)

// Sends the one-time sign-in code. When SMTP is not configured and we are not in production,
// the code is printed to the dev server console instead, so sign-in can be tested locally.
export async function sendLoginCode(email: string, code: string) {
  if (!smtpConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[auth] SMTP not configured. One-time code for ${email}: ${code}`)
      return
    }
    throw new Error('Email is not configured (SMTP_HOST / EMAIL_FROM).')
  }
  const port = Number(process.env.SMTP_PORT || 587)
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })
  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `${code} is your HSN log-in code`,
    text: `Your Healthcare Sustainability Network log-in code is ${code}.\n\nIt expires in 10 minutes. If you did not ask for it, you can ignore this email.`,
    html: `<p>Your Healthcare Sustainability Network log-in code is</p><p style="font-size:28px;font-weight:700;letter-spacing:6px;color:#0B6B3A">${code}</p><p>It expires in 10 minutes. If you did not ask for it, you can ignore this email.</p>`,
  })
}
