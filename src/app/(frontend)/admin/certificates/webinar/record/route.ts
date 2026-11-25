import { getAdmin } from '@/lib/admin/auth'
import { formatIssuedAt } from '@/lib/courses/certificate'
import { formatCertificateNo, roleLabel } from '@/lib/certificates/webinar'
import { webinarRecordDocx } from '@/lib/certificates/record-docx'
import { getPayloadClient } from '@/lib/payload'

export async function GET() {
  if (!(await getAdmin())) return new Response('Not signed in', { status: 401 })
  const payload = await getPayloadClient()
  const webinars = await payload.find({ collection: 'webinar-certificates', sort: '-createdAt', limit: 500, depth: 0, overrideAccess: true })
  const top = await payload.find({ collection: 'webinar-certificates', where: { certificateNo: { greater_than: 0 } }, sort: '-certificateNo', limit: 1, depth: 0, overrideAccess: true })
  const nextNo = formatCertificateNo((top.docs[0]?.certificateNo ?? 0) + 1)
  const last = webinars.docs[0]
  const bytes = await webinarRecordDocx({
    last: last
      ? {
          when: formatIssuedAt(last.createdAt),
          to: last.recipient,
          number: last.certificateNo ? formatCertificateNo(last.certificateNo, last.heldOn) : 'Not assigned',
        }
      : null,
    nextNo,
    rows: webinars.docs.map((doc) => ({
      number: doc.certificateNo ? formatCertificateNo(doc.certificateNo, doc.heldOn) : 'Not assigned',
      to: doc.recipient,
      when: formatIssuedAt(doc.createdAt),
      role: roleLabel(doc.role),
      webinar: doc.webinar,
      heldOn: doc.heldOn,
    })),
  })
  return new Response(new Uint8Array(bytes), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="hsn-webinar-certificate-record.docx"',
      'Cache-Control': 'no-store',
    },
  })
}
