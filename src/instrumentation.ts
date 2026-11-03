// Runs once when the server starts. Admin dates and times ("Today 09:12", logins per day) are shown in HSN's
// time zone rather than the server's (Vercel servers run on UTC and don't allow setting TZ directly).
export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') process.env.TZ = process.env.SITE_TIMEZONE || 'Asia/Kolkata'
}
