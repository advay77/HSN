'use client'

// Read aloud with the browser's built-in voice (speechSynthesis). Reads the page block by block and highlights
// the word being spoken with the CSS Custom Highlight API, so the page DOM is never changed.

type ReaderState = { status: 'idle' | 'playing' | 'paused'; index: number; total: number }

let state: ReaderState = { status: 'idle', index: 0, total: 0 }
const listeners = new Set<() => void>()
let blocks: HTMLElement[] = []
let opts = { rate: 1, lang: 'en' }
let runId = 0

const set = (patch: Partial<ReaderState>) => {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

export const getReader = () => state
// Must return the same object every time, or useSyncExternalStore loops.
const SERVER_STATE: ReaderState = { status: 'idle', index: 0, total: 0 }
export const getServerReader = (): ReaderState => SERVER_STATE
export function subscribeReader(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window

const LANGS: Record<string, string> = { en: 'en-GB', hi: 'hi-IN', ar: 'ar-SA' }
const BLOCK_SEL = 'h1, h2, h3, h4, h5, p, li, dt, dd, blockquote, figcaption, th, td, label, .lead'

type Hl = { highlights?: Map<string, unknown> }
const highlightApi = () => (typeof CSS !== 'undefined' ? (CSS as unknown as Hl).highlights : undefined)
const HighlightCtor = () => (typeof window !== 'undefined' ? (window as unknown as { Highlight?: new (...r: Range[]) => unknown }).Highlight : undefined)

function clearHighlight() {
  highlightApi()?.delete('hsn-read')
}

function highlightWord(el: HTMLElement, charIndex: number, length: number) {
  const api = highlightApi()
  const H = HighlightCtor()
  if (!api || !H) return
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  let pos = 0
  let node: Node | null
  while ((node = walker.nextNode())) {
    const len = node.textContent?.length ?? 0
    if (charIndex < pos + len) {
      const start = charIndex - pos
      const range = document.createRange()
      range.setStart(node, start)
      range.setEnd(node, Math.min(len, start + Math.max(1, length)))
      api.set('hsn-read', new H(range))
      return
    }
    pos += len
  }
}

function speakFrom(i: number, id: number) {
  if (id !== runId) return
  if (i >= blocks.length) {
    stopReading()
    return
  }
  const el = blocks[i]!
  const text = el.textContent || ''
  set({ index: i })
  if (!text.trim()) return speakFrom(i + 1, id)
  el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  const u = new SpeechSynthesisUtterance(text)
  u.rate = opts.rate
  u.lang = LANGS[opts.lang] || opts.lang
  u.onboundary = (e) => {
    if (e.name === 'word' || e.name === undefined) {
      const len = e.charLength || (text.slice(e.charIndex).match(/^\S+/)?.[0].length ?? 1)
      highlightWord(el, e.charIndex, len)
    }
  }
  u.onend = () => speakFrom(i + 1, id)
  u.onerror = () => {
    if (id === runId) stopReading()
  }
  window.speechSynthesis.speak(u)
}

function collect(root: ParentNode): HTMLElement[] {
  const all = Array.from(root.querySelectorAll<HTMLElement>(BLOCK_SEL))
  // Skip blocks nested in another block (e.g. .lead inside li) and hidden ones.
  return all.filter((el) => !all.some((o) => o !== el && o.contains(el)) && el.offsetParent !== null)
}

/** Read a whole page area (defaults to <main>), or a single element. */
export function startReading(target?: HTMLElement | null, o?: { rate: number; lang: string }) {
  if (!speechSupported()) return
  if (o) opts = o
  window.speechSynthesis.cancel()
  runId++
  const root = target ?? document.querySelector('main')
  if (!root) return
  blocks = target && target.matches(BLOCK_SEL) ? [target] : collect(root)
  set({ status: 'playing', index: 0, total: blocks.length })
  speakFrom(0, runId)
}

export function setReaderOptions(o: { rate: number; lang: string }) {
  opts = o
}

export function togglePause() {
  if (!speechSupported()) return
  if (state.status === 'playing') {
    window.speechSynthesis.pause()
    set({ status: 'paused' })
  } else if (state.status === 'paused') {
    window.speechSynthesis.resume()
    set({ status: 'playing' })
  } else {
    startReading()
  }
}

export function stopReading() {
  runId++
  if (speechSupported()) window.speechSynthesis.cancel()
  clearHighlight()
  set({ status: 'idle', index: 0, total: 0 })
}
