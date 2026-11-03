// Converts a Claude Design `.dc.html` board into a JSX starting point so the
// production markup keeps the design's exact elements, classes and inline styles.
// Usage: node tools/dc2jsx.mjs <file.dc.html> [outDir]
// Writes <Name>.jsx (markup), <Name>.css (page <style> rules) and <Name>.logic.js (the board's script).
import fs from 'node:fs'
import path from 'node:path'

const VOID = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'source', 'area', 'col', 'wbr', 'track'])
const INLINE_PARENTS = new Set(['p', 'span', 'a', 'li', 'label', 'strong', 'em', 'b', 'i', 'small', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'td', 'th', 'dd', 'dt', 'figcaption', 'blockquote', 'q', 'cite', 'code'])
const RENAME = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength',
  minlength: 'minLength', colspan: 'colSpan', rowspan: 'rowSpan', autocomplete: 'autoComplete',
  inputmode: 'inputMode', crossorigin: 'crossOrigin', enctype: 'encType', novalidate: 'noValidate',
  autofocus: 'autoFocus', spellcheck: 'spellCheck', datetime: 'dateTime', allowfullscreen: 'allowFullScreen',
  frameborder: 'frameBorder', contenteditable: 'contentEditable', srcset: 'srcSet', 'xlink:href': 'xlinkHref',
  'xml:space': 'xmlSpace', referrerpolicy: 'referrerPolicy', playsinline: 'playsInline', accesskey: 'accessKey',
}

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
const hole = /\{\{\s*([\s\S]+?)\s*\}\}/g

function exprValue(v) {
  const whole = v.match(/^\s*\{\{\s*([\s\S]+?)\s*\}\}\s*$/)
  if (whole) return `{${whole[1]}}`
  if (hole.test(v)) {
    hole.lastIndex = 0
    return '{`' + v.replace(/`/g, '\\`').replace(hole, (_, e) => '${' + e + '}') + '`}'
  }
  return JSON.stringify(v)
}

function styleValue(v) {
  if (/^\s*\{\{[\s\S]+\}\}\s*$/.test(v)) return exprValue(v)
  const parts = []
  for (const decl of v.split(/;(?![^(]*\))/)) {
    const i = decl.indexOf(':')
    if (i < 0) continue
    const k = decl.slice(0, i).trim()
    const val = decl.slice(i + 1).trim()
    if (!k) continue
    const key = k.startsWith('--') ? JSON.stringify(k) : camel(k.toLowerCase())
    const out = hole.test(val) ? (hole.lastIndex = 0, '`' + val.replace(hole, (_, e) => '${' + e + '}') + '`') : JSON.stringify(val)
    hole.lastIndex = 0
    parts.push(`${key}: ${out}`)
  }
  return `{{ ${parts.join(', ')} }}`
}

function parseAttrs(src) {
  const attrs = []
  const re = /([^\s=\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g
  let m
  while ((m = re.exec(src))) attrs.push([m[1], m[2] ?? m[3] ?? m[4] ?? null])
  return attrs
}

function attrsToJsx(attrs) {
  const out = []
  for (let [k, v] of attrs) {
    if (k.startsWith('hint-')) continue
    let name = RENAME[k] || k
    if (!RENAME[k] && k.includes('-') && !k.startsWith('aria-') && !k.startsWith('data-')) name = camel(k)
    if (/^on[a-z]/.test(name)) name = 'on' + name[2].toUpperCase() + name.slice(3)
    if (v === null) { out.push(name); continue }
    v = v.replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    out.push(`${name}=${name === 'style' ? styleValue(v) : exprValue(v)}`)
  }
  return out.length ? ' ' + out.join(' ') : ''
}

function textToJsx(t) {
  return t
    .replace(/[{}]/g, (c) => (c === '{' ? '\u0000L' : '\u0000R'))
    .replace(/\u0000L\u0000L\s*([\s\S]+?)\s*\u0000R\u0000R/g, (_, e) => `{${e}}`)
    .replace(/\u0000L/g, "{'{'}").replace(/\u0000R/g, "{'}'}")
}

export function convert(html) {
  const body = (html.match(/<x-dc>([\s\S]*)<\/x-dc>/) || [, html])[1]
  const styles = [...body.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1].trim()).join('\n')
  const markup = body.replace(/<helmet>[\s\S]*?<\/helmet>/, '')
  const script = (html.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/) || [, ''])[1].trim()

  const tokens = markup.match(/<!--[\s\S]*?-->|<\/?[a-zA-Z][\w-]*(?:"[^"]*"|'[^']*'|[^'">])*>|[^<]+/g) || []
  const stack = []
  const imports = new Set()
  let out = ''
  const prevIsElement = () => /[>}]\s*$/.test(out)

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i]
    if (tok.startsWith('<!--')) { out += `{/* ${tok.slice(4, -3).trim()} */}`; continue }
    if (tok.startsWith('</')) {
      const tag = tok.slice(2, -1).trim()
      const open = stack.pop()
      if (tag === 'sc-for') out += '</React.Fragment>))}'
      else if (tag === 'sc-if') out += '</>)}'
      else if (tag === 'dc-import') { /* self-closed on open */ }
      else out += `</${open?.tag ?? tag}>`
      continue
    }
    if (tok.startsWith('<')) {
      const m = tok.match(/^<([a-zA-Z][\w-]*)([\s\S]*?)(\/?)>$/)
      const tag = m[1].toLowerCase() === m[1] ? m[1] : m[1]
      const attrs = parseAttrs(m[2])
      const selfClose = m[3] === '/' || VOID.has(tag)
      const get = (n) => attrs.find(([k]) => k === n)?.[1]
      if (tag === 'sc-for') {
        const list = get('list').replace(/^\{\{\s*|\s*\}\}$/g, '')
        const as = get('as') || 'item'
        out += `{(${list}).map((${as}, ${as}Index) => (<React.Fragment key={${as}Index}>`
        stack.push({ tag })
        continue
      }
      if (tag === 'sc-if') {
        const v = get('value').replace(/^\{\{\s*|\s*\}\}$/g, '')
        out += `{(${v}) && (<>`
        stack.push({ tag })
        continue
      }
      if (tag === 'dc-import') {
        const name = get('name')
        imports.add(name)
        out += `<${name}${attrsToJsx(attrs.filter(([k]) => k !== 'name'))} />`
        if (!selfClose) stack.push({ tag })
        continue
      }
      out += `<${tag}${attrsToJsx(attrs)}${selfClose ? ' />' : '>'}`
      if (!selfClose) stack.push({ tag })
      continue
    }
    // text
    const parent = [...stack].reverse().find((s) => !s.tag.startsWith('sc-'))
    const inline = parent && INLINE_PARENTS.has(parent.tag)
    const next = tokens[i + 1] || ''
    const nextIsElement = next.startsWith('<') && !next.startsWith('</')
    if (!tok.trim()) {
      if (/\n/.test(tok)) out += inline && prevIsElement() && nextIsElement ? "{' '}\n" : '\n'
      else out += inline || prevIsElement() ? ' ' : ''
      continue
    }
    const lead = /^\s/.test(tok), trail = /\s$/.test(tok)
    const t = textToJsx(tok.trim().replace(/\s+/g, ' '))
    out += (lead && prevIsElement() ? "{' '}" : '') + t + (trail && nextIsElement ? "{' '}" : '')
  }
  return { jsx: out.trim(), styles, script, imports: [...imports] }
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const [file, outDir = 'design-src'] = process.argv.slice(2)
  const name = path.basename(file).replace(/\.dc\.html$/, '')
  const r = convert(fs.readFileSync(file, 'utf8'))
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, `${name}.jsx`), `// imports: ${r.imports.join(', ')}\n` + r.jsx + '\n')
  if (r.styles) fs.writeFileSync(path.join(outDir, `${name}.css`), r.styles + '\n')
  if (r.script) fs.writeFileSync(path.join(outDir, `${name}.logic.js`), r.script + '\n')
  console.log(`${name}: ${r.jsx.length} chars, imports [${r.imports.join(', ')}]`)
}
