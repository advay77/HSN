import JSZip from 'jszip'

export type CertificateRecordRow = {
  number: string
  to: string
  when: string
  role: string
  webinar: string
  heldOn: string
}

export type CertificateRecord = {
  last: { when: string; to: string; number: string } | null
  nextNo: string
  rows: CertificateRecordRow[]
}

const esc = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const run = (text: string, bold = false, size = 20) =>
  `<w:r><w:rPr>${bold ? '<w:b/>' : ''}<w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r>`

const para = (text: string, bold = false, size = 20) => `<w:p>${run(text, bold, size)}</w:p>`

const cell = (text: string, width: number, header = false) =>
  `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${header ? '<w:shd w:val="clear" w:color="auto" w:fill="E7F4F2"/>' : ''}</w:tcPr><w:p>${run(text, header)}</w:p></w:tc>`

const WIDTHS = [2100, 2600, 2800, 1600, 4200, 2200]

function row(values: string[], header = false) {
  return `<w:tr>${values.map((value, i) => cell(value, WIDTHS[i], header)).join('')}</w:tr>`
}

function documentXml(record: CertificateRecord) {
  const last = record.last
    ? [
        para('Last document issued', true),
        para(`Issued on: ${record.last.when}`),
        para(`Issued to: ${record.last.to}`),
        para(`Certificate number: ${record.last.number}`),
      ]
    : [para('No webinar certificate has been issued yet.')]
  const table = `<w:tbl>
<w:tblPr><w:tblW w:w="${WIDTHS.reduce((a, b) => a + b, 0)}" w:type="dxa"/><w:tblBorders>
<w:top w:val="single" w:sz="4" w:space="0" w:color="DCD5C2"/>
<w:left w:val="single" w:sz="4" w:space="0" w:color="DCD5C2"/>
<w:bottom w:val="single" w:sz="4" w:space="0" w:color="DCD5C2"/>
<w:right w:val="single" w:sz="4" w:space="0" w:color="DCD5C2"/>
<w:insideH w:val="single" w:sz="4" w:space="0" w:color="DCD5C2"/>
<w:insideV w:val="single" w:sz="4" w:space="0" w:color="DCD5C2"/>
</w:tblBorders></w:tblPr>
<w:tblGrid>${WIDTHS.map((w) => `<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>
${row(['Certificate number', 'Issued to', 'Issued on', 'Role', 'Webinar', 'Webinar date'], true)}
${record.rows.map((r) => row([r.number, r.to, r.when, r.role, r.webinar, r.heldOn])).join('')}
</w:tbl>`
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>
<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr>${run('HSN webinar certificate record', true, 32)}</w:p>
${last.join('')}
${para(`Next number, assigned automatically: ${record.nextNo}`)}
${para('')}
${table}
<w:sectPr>
<w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>
<w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="360" w:footer="360" w:gutter="0"/>
</w:sectPr>
</w:body>
</w:document>`
}

/** A Word file of every issued webinar certificate, with the last number called out. */
export async function webinarRecordDocx(record: CertificateRecord) {
  const zip = new JSZip()
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`,
  )
  zip.folder('_rels')?.file(
    '.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
  )
  const word = zip.folder('word')
  word?.file('document.xml', documentXml(record))
  word?.file(
    'styles.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:pPr><w:spacing w:before="0" w:after="200"/><w:keepNext/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr></w:style>
</w:styles>`,
  )
  word?.folder('_rels')?.file(
    'document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
  )
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
}
