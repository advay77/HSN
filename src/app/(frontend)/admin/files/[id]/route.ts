import { requireAdmin } from '@/lib/admin/auth'
import { serveMediaFile } from '@/lib/media-file'

// Opens any uploaded file, including private ones (case study attachments), for signed-in admins.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireAdmin('/admin/case-studies')
  return serveMediaFile(id)
}
