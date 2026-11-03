// Design-vs-site layout check. Opens each design board (preview server, port 8765) and the matching
// site route (port 3000) at phone, tablet and laptop width, matches elements inside <main> by tag + text,
// and reports any position, size or style difference. Also saves full-page screenshots of both.
// Usage: node tools/compare.mjs [outDir] [filter]
// Needs: design preview running (D:\HSN-Design-System\START-PREVIEW.bat) and `npm run dev`.
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'

const DESIGN = 'http://127.0.0.1:8765'
const SITE = 'http://localhost:3000'
const WIDTHS = [390, 834, 1440]
const outDir = process.argv[2] || 'qa-out'
const filter = process.argv[3] || ''

export const PAIRS = [
  ['Home', '/'],
  ['About', '/about'],
  ['Services', '/services'],
  ['Courses', '/courses'],
  ['Course', '/courses/healthcare-sustainability-from-awareness-to-action'],
  ['Register', '/register?course=healthcare-sustainability-from-awareness-to-action'],
  ['CaseStudies', '/case-studies'],
  ['SubmitCase', '/case-studies/submit'],
  ['Library', '/library'],
  ['Contact', '/contact'],
  ['GetInvolved', '/get-involved'],
  ['Membership', '/membership'],
  ['Privacy', '/privacy'],
  ['Login', '/login'],
  ['HomeAr', '/ar'],
  ['MembershipAr', '/ar/membership'],
  // Admin boards need HSN_ADMIN_TOKEN (from `npx payload run tools/dev-admin-token.ts`).
  ['AdminOverview', '/admin'],
  ['AdminMembers', '/admin/members'],
  ['AdminRegistrations', '/admin/registrations'],
  ['AdminInterest', '/admin/interest'],
  ['AdminCases', '/admin/case-studies'],
  ['AdminCourses', '/admin/courses'],
]

const collect = () => {
  const root = document.querySelector('main') || document.body
  const base = root.getBoundingClientRect()
  const tags = 'h1,h2,h3,h4,h5,h6,p,a,button,li,img,label,input,select,textarea,figure,article,section,nav,form,table'
  const out = []
  for (const el of root.querySelectorAll(tags)) {
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden') continue
    const text = (el.tagName === 'IMG' ? 'img:' + (el.getAttribute('alt') || '') : el.tagName === 'INPUT' ? 'input:' + (el.getAttribute('placeholder') || el.name || el.type) : el.textContent || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120)
    out.push({
      key: (el.textContent || text).replace(/\s+/g, '').slice(0, 160),
      tag: el.tagName.toLowerCase(),
      cls: (el.getAttribute('class') || '').slice(0, 40),
      text,
      x: Math.round(r.left - base.left),
      y: Math.round(r.top - base.top),
      w: Math.round(r.width),
      h: Math.round(r.height),
      st: [cs.fontFamily.split(',')[0], cs.fontSize, cs.fontWeight, cs.color, cs.textAlign, cs.backgroundColor].join('|'),
    })
  }
  return {
    items: out,
    mainH: Math.round(base.height),
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  }
}

function diff(d, s) {
  const used = new Set()
  const rows = []
  let matched = 0
  for (const a of d.items) {
    // Containers differ only in source whitespace between children, so match on text without spaces.
    const i = s.items.findIndex((b, j) => !used.has(j) && b.tag === a.tag && b.key === a.key)
    if (i < 0) {
      rows.push(`  MISSING on site: <${a.tag} .${a.cls}> "${a.text}"`)
      continue
    }
    used.add(i)
    matched++
    const b = s.items[i]
    const pos = ['x', 'y', 'w', 'h'].filter((k) => Math.abs(a[k] - b[k]) > 2)
    const style = a.st !== b.st
    if (pos.length || style) {
      rows.push(
        `  DIFF <${a.tag} .${a.cls}> "${a.text.slice(0, 40)}" ` +
          pos.map((k) => `${k}:${a[k]}→${b[k]}`).join(' ') +
          (style ? ` style: ${a.st} → ${b.st}` : ''),
      )
    }
  }
  s.items.forEach((b, j) => {
    if (!used.has(j)) rows.push(`  EXTRA on site: <${b.tag} .${b.cls}> "${b.text}"`)
  })
  return { matched, rows }
}

// Uses the installed Microsoft Edge (Chromium) so no browser download is needed.
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'msedge' })
fs.mkdirSync(outDir, { recursive: true })
const report = []
for (const [board, route] of PAIRS.filter(([b]) => !filter || filter.split(',').includes(b))) {
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 })
    if (process.env.HSN_ADMIN_TOKEN) {
      await ctx.addCookies([{ name: 'hsn_admin', value: process.env.HSN_ADMIN_TOKEN, url: SITE }])
    }
    const page = await ctx.newPage()
    const grab = async (url, shot) => {
      const res = await page.goto(url, { waitUntil: 'networkidle' }).catch((e) => ({ status: () => String(e.message).slice(0, 80) }))
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(800)
      await page.screenshot({ path: path.join(outDir, shot), fullPage: true })
      return { status: res?.status?.(), ...(await page.evaluate(collect)) }
    }
    const d = await grab(`${DESIGN}/${board}.dc.html`, `${board}-${w}-design.png`)
    const s = await grab(SITE + route, `${board}-${w}-site.png`)
    const { matched, rows } = diff(d, s)
    report.push(
      `${board} @${w}: site ${s.status}, matched ${matched}/${d.items.length}, main height ${d.mainH}→${s.mainH}` +
        (s.overflow ? ' , SITE HAS HORIZONTAL SCROLL' : '') +
        (d.overflow ? ' (design also scrolls)' : ''),
    )
    report.push(...rows.slice(0, 60))
    if (rows.length > 60) report.push(`  … ${rows.length - 60} more`)
    await ctx.close()
  }
}
await browser.close()
fs.writeFileSync(path.join(outDir, 'report.txt'), report.join('\n') + '\n')
console.log(report.filter((l) => !l.startsWith('  ')).join('\n'))
