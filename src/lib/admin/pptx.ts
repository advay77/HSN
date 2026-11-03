// PowerPoint (.pptx) → course lessons, for "Import a PowerPoint as a module" in the admin course editor.
// A .pptx is a zip: slide order comes from ppt/presentation.xml + its rels, slide text from <a:t> runs,
// links from each slide's rels. Plain module (no server-only) so it can also be run from scripts.
import JSZip from 'jszip'

export type ImportedLesson = {
  kind: 'cover' | 'text' | 'diagram' | 'video' | 'references' | 'summary'
  title: string
  body: string
  video?: string
  references?: { text: string; url: string }[]
  image?: { name: string; mime: string; data: string } // base64, for the diagram picture
  slide: number
}

export type ImportResult = {
  fileName: string
  slides: number
  lessons: ImportedLesson[]
  videoSlides: number[]
  diagramSlides: number[]
  referenceSlides: number[]
  hasQuiz: false // slides never contain a gradable quiz; questions are added after import
}

const decode = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&')

const attr = (xml: string, name: string) => xml.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]

type Shape = { y: number; x: number; size: number; isTitle: boolean; paras: string[]; links: string[] }
type Pic = { area: number; rId: string }

const YT = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/

function parseRels(xml: string | undefined) {
  const map = new Map<string, { target: string; type: string; external: boolean }>()
  for (const m of (xml || '').matchAll(/<Relationship\b[^>]*\/>/g)) {
    const id = attr(m[0], 'Id')
    if (id) map.set(id, { target: decode(attr(m[0], 'Target') || ''), type: attr(m[0], 'Type') || '', external: attr(m[0], 'TargetMode') === 'External' })
  }
  return map
}

function parseShapes(xml: string, rels: ReturnType<typeof parseRels>) {
  const shapes: Shape[] = []
  for (const m of xml.matchAll(/<p:sp>([\s\S]*?)<\/p:sp>/g)) {
    const sp = m[1]!
    const ph = sp.match(/<p:ph\b[^>]*>/)?.[0]
    const phType = ph ? attr(ph, 'type') : undefined
    const off = sp.match(/<a:off\b[^>]*>/)?.[0]
    const paras: string[] = []
    const links: string[] = []
    let size = 0
    for (const p of sp.matchAll(/<a:p>([\s\S]*?)<\/a:p>/g)) {
      const text = [...p[1]!.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((t) => decode(t[1]!)).join('')
      for (const sz of p[1]!.matchAll(/<a:(?:rPr|endParaRPr)\b[^>]*\bsz="(\d+)"/g)) size = Math.max(size, Number(sz[1]))
      for (const h of p[1]!.matchAll(/<a:hlinkClick\b[^>]*r:id="([^"]+)"/g)) {
        const r = rels.get(h[1]!)
        if (r?.external) links.push(r.target)
      }
      if (text.trim()) paras.push(text.replace(/\s+/g, ' ').trim())
    }
    if (!paras.length) continue
    shapes.push({
      x: Number(attr(off || '', 'x') || 0),
      y: Number(attr(off || '', 'y') || 0),
      size,
      isTitle: phType === 'title' || phType === 'ctrTitle',
      paras,
      links,
    })
  }
  return shapes.sort((a, b) => a.y - b.y || a.x - b.x)
}

function parsePics(xml: string, slideArea: number) {
  const pics: Pic[] = []
  for (const m of xml.matchAll(/<p:pic>([\s\S]*?)<\/p:pic>/g)) {
    const rId = m[1]!.match(/<a:blip\b[^>]*r:embed="([^"]+)"/)?.[1]
    const ext = m[1]!.match(/<a:ext\b[^>]*cx="(\d+)"[^>]*cy="(\d+)"/)
    if (!rId || !ext) continue
    pics.push({ rId, area: (Number(ext[1]) * Number(ext[2])) / slideArea })
  }
  return pics
}

const MIME: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp' }

export async function parsePptx(data: ArrayBuffer | Uint8Array | Buffer, fileName = 'slides.pptx'): Promise<ImportResult> {
  const zip = await JSZip.loadAsync(data)
  const read = (p: string) => zip.file(p)?.async('string')
  const pres = await read('ppt/presentation.xml')
  if (!pres) throw new Error('This file is not a PowerPoint (.pptx) presentation.')
  const presRels = parseRels(await read('ppt/_rels/presentation.xml.rels'))
  const sz = pres.match(/<p:sldSz\b[^>]*>/)?.[0]
  const slideArea = Number(attr(sz || '', 'cx') || 12192000) * Number(attr(sz || '', 'cy') || 6858000)
  const order = [...(pres.match(/<p:sldIdLst>([\s\S]*?)<\/p:sldIdLst>/)?.[1] || '').matchAll(/<p:sldId\b[^>]*r:id="([^"]+)"/g)]
    .map((m) => presRels.get(m[1]!)?.target)
    .filter((t): t is string => !!t)
    .map((t) => 'ppt/' + t.replace(/^\/?ppt\//, '').replace(/^\.\//, ''))

  const raw = []
  for (const path of order) {
    const xml = (await read(path)) || ''
    const relPath = path.replace(/slides\/(slide\d+\.xml)$/, 'slides/_rels/$1.rels')
    const rels = parseRels(await read(relPath))
    raw.push({ path, xml, rels, shapes: parseShapes(xml, rels), pics: parsePics(xml, slideArea) })
  }

  // Text that repeats on most slides (deck header/footer) is decoration, not lesson content.
  const seen = new Map<string, number>()
  for (const s of raw) for (const t of new Set(s.shapes.map((sh) => sh.paras.join(' ')))) seen.set(t, (seen.get(t) ?? 0) + 1)
  const boiler = new Set([...seen].filter(([, n]) => raw.length > 2 && n >= Math.max(3, raw.length / 2)).map(([t]) => t))

  const lessons: ImportedLesson[] = []
  const videoSlides: number[] = []
  const diagramSlides: number[] = []
  const referenceSlides: number[] = []


  for (let i = 0; i < raw.length; i++) {
    const s = raw[i]!
    const n = i + 1
    const shapes = s.shapes.filter((sh) => !boiler.has(sh.paras.join(' ')))
    // Title: the title placeholder, else the biggest short one-line text box. Many decks have no title
    // box at all; then the first sentence of the slide is used (the admin can rename it).
    const short = shapes.filter((sh) => sh.paras.length === 1 && sh.paras[0]!.length <= 90 && !/^https?:\/\//i.test(sh.paras[0]!))
    const titleShape = shapes.find((sh) => sh.isTitle) ?? [...short].sort((a, b) => b.size - a.size || a.y - b.y)[0]
    const rest = shapes.filter((sh) => sh !== titleShape)
    const paras = rest.flatMap((sh) => sh.paras)
    let title = titleShape ? titleShape.paras.join(' ').trim() : ''
    if (!title) {
      const first = (paras.find((p) => !/^https?:\/\//i.test(p)) ?? '').match(/^.*?[.!?](?=\s|\[|$)/)?.[0] ?? paras[0] ?? ''
      title = first.length > 90 ? first.slice(0, 87).replace(/\s+\S*$/, '') + '…' : first || `Slide ${n}`
    }
    const links = [...new Set([...rest.flatMap((sh) => sh.links), ...[...s.rels.values()].filter((r) => r.external).map((r) => r.target)])]
    const body = paras.join('\n\n')

    const yt = [body, ...links].map((t) => t.match(YT)?.[1]).find(Boolean)
    if (/^references?$|^sources?$|^bibliography$/i.test(title.trim())) {
      referenceSlides.push(n)
      const urls = links.filter((l) => /^https?:/i.test(l))
      const refs = paras.map((p, k) => {
        const inText = p.match(/https?:\/\/\S+/)?.[0]
        const text = (p.replace(/https?:\/\/\S+/, '').trim() || p).replace(/^\[?\d+[.)\]]\s*/, '')
        return { text, url: inText || urls[k] || '' }
      })
      lessons.push({ kind: 'references', title, body: '', references: refs, slide: n })
      continue
    }
    if (yt) {
      videoSlides.push(n)
      lessons.push({ kind: 'video', title, body: paras.filter((p) => !YT.test(p)).join('\n\n'), video: `https://www.youtube.com/watch?v=${yt}`, slide: n })
      continue
    }
    // A picture covering a good part of the slide is a diagram; small ones (logos) are ignored.
    const big = s.pics.filter((p) => p.area > 0.12).sort((a, b) => b.area - a.area)[0]
    if (big && i > 0) {
      const target = s.rels.get(big.rId)?.target
      const mediaPath = target ? 'ppt/' + target.replace(/^\.\.\//, '') : ''
      const file = mediaPath ? zip.file(mediaPath) : null
      const ext = mediaPath ? mediaPath.split('.').pop()!.toLowerCase() : ''
      if (file && MIME[ext]) {
        diagramSlides.push(n)
        lessons.push({
          kind: 'diagram',
          title,
          body,
          image: { name: mediaPath.split('/').pop()!, mime: MIME[ext]!, data: await file.async('base64') },
          slide: n,
        })
        continue
      }
    }
    const isSummary = i > 0 && paras.concat(title).some((p) => /^module\s+\d+\s+complete\b/i.test(p))
    lessons.push({ kind: i === 0 ? 'cover' : isSummary ? 'summary' : 'text', title, body, slide: n })
  }

  return { fileName, slides: raw.length, lessons, videoSlides, diagramSlides, referenceSlides, hasQuiz: false }
}
