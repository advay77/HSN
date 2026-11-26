'use client'

import React, { useState } from 'react'

// Saves the certificate on this page as an A4 landscape PDF file in one click (no print window).
// The sheet is laid out at a fixed 1000 × 707 px design size (see CertificateFit), so it is drawn at that
// size, without the on-screen scaling, at 3× for sharp text, then placed on a full A4 page.
const SHEET_W = 1000
const SHEET_H = 707

const toDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = reject
    r.readAsDataURL(blob)
  })

// The certificate's fonts come from Google Fonts, a different site, so the picture can't read them from the page.
// Fetch their CSS and font files here and hand them over inline: the sheet's own stylesheet (Garamond, Great Vibes,
// Playfair) plus Inter and Montserrat, which the certificate text also uses.
async function googleFontsCss(): Promise<string> {
  const own = document.querySelector<HTMLLinkElement>('link[rel="stylesheet"][href*="fonts.googleapis.com"][href*="Great+Vibes"]')
  const hrefs = own ? [own.href, 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600&display=swap'] : []
  const sheets = await Promise.all(
    hrefs.map(async (href) => {
      // Only the Latin character sets: the Cyrillic, Greek and Vietnamese ones aren't used and would slow this down.
      const all = await (await fetch(href)).text()
      const blocks = all.split(/(?=\/\* )/).filter((b) => /^\/\* latin(-ext)? \*\//.test(b))
      let css = blocks.length ? blocks.join('') : all
      const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1]!))]
      const inlined = await Promise.all(urls.map(async (u) => [u, await toDataUrl(await (await fetch(u)).blob())] as const))
      for (const [u, data] of inlined) css = css.split(u).join(data)
      return css
    }),
  )
  return sheets.join('\n')
}

export function DownloadCertificatePdf({ fileName }: { fileName: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const download = async () => {
    const sheet = document.querySelector<HTMLElement>('.cert.fit .cert-sheet')
    if (!sheet) return
    setBusy(true)
    setError('')
    try {
      await document.fonts.ready
      const [{ toPng }, { jsPDF }] = await Promise.all([import('html-to-image'), import('jspdf')])
      const fontEmbedCSS = await googleFontsCss().catch(() => undefined)
      const png = await toPng(sheet, {
        fontEmbedCSS,
        width: SHEET_W,
        height: SHEET_H,
        pixelRatio: 3,
        backgroundColor: '#FFFFFF',
        style: { transform: 'none', margin: '0' },
      })
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true })
      pdf.addImage(png, 'PNG', 0, 0, 297, 210, undefined, 'FAST')
      pdf.save(`${fileName}.pdf`)
    } catch {
      setError('The PDF could not be made in this browser. Use Print instead and choose “Save as PDF”.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="stack g4" style={{ alignItems: 'flex-end' }}>
      <span className="row g8" style={{ flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-t" onClick={() => window.print()}>Print</button>
        <button type="button" className="btn btn-p" onClick={download} disabled={busy}>{busy ? 'Preparing PDF…' : 'Download PDF'}</button>
      </span>
      {error && <span className="small" role="alert" style={{ color: '#B42318' }}>{error}</span>}
    </span>
  )
}

