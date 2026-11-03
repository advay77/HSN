import 'server-only'

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import fs from 'fs/promises'
import path from 'path'

import type { Media } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'

const INLINE = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']

let s3: S3Client | null = null
const s3Client = () =>
  (s3 ??= new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'ap-south-1',
    forcePathStyle: true,
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID || '', secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '' },
  }))

// Reads the stored bytes: from Supabase Storage when S3_BUCKET is set (see payload.config.ts), else from media/.
async function readStored(filename: string): Promise<Uint8Array | null> {
  const name = path.basename(filename)
  try {
    if (process.env.S3_BUCKET) {
      const res = await s3Client().send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: name }))
      return res.Body ? await res.Body.transformToByteArray() : null
    }
    const payload = await getPayloadClient()
    const upload = payload.collections.media.config.upload
    const dir = path.resolve(process.cwd(), (typeof upload === 'object' && upload.staticDir) || 'media')
    return new Uint8Array(await fs.readFile(path.join(dir, name)))
  } catch {
    return null
  }
}

// Sends a stored media file in the response, for files that are not public (see collections/Media.ts).
export async function serveMediaFile(id: number | string): Promise<Response> {
  const payload = await getPayloadClient()
  const doc = (await payload.findByID({ collection: 'media', id, depth: 0 }).catch(() => null)) as Media | null
  if (!doc?.filename) return new Response('Not found', { status: 404 })
  const data = await readStored(doc.filename)
  if (!data) return new Response('Not found', { status: 404 })
  const type = doc.mimeType || 'application/octet-stream'
  const inline = INLINE.includes(type)
  return new Response(data as BodyInit, {
    headers: {
      'Content-Type': inline ? type : 'application/octet-stream',
      'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${doc.filename.replace(/[^\w.\- ]/g, '_')}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  })
}
