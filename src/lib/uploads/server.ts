import 'server-only'

import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'
import crypto from 'node:crypto'

// Large files and Vercel: a request to a Vercel function can carry at most 4.5 MB, so in production the
// browser uploads files straight to Supabase Storage (under incoming/) with a signed upload URL, and the
// server action receives only "incoming:<path>". The server then reads, checks and stores the file.
// Without the Supabase settings (local development) files travel inside the form as before.

export const INCOMING = 'incoming:'
export type UploadPurpose = 'case-attachment' | 'admin' | 'admin-video'
export const PURPOSE_LIMITS: Record<UploadPurpose, number> = {
  'case-attachment': 10 * 1024 * 1024,
  admin: 30 * 1024 * 1024,
  'admin-video': 50 * 1024 * 1024,
}

export const directUploadsEnabled = () =>
  Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.S3_BUCKET)

let s3: S3Client | null = null
const client = () =>
  (s3 ??= new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'ap-south-1',
    forcePathStyle: true,
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID || '', secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '' },
  }))

const safeName = (name: string) => name.replace(/[^\w.\-]+/g, '_').slice(-120) || 'file'

/** Removes uploads left in incoming/ for over a day (the person closed the page before saving). Best effort. */
export async function sweepIncoming(): Promise<void> {
  const bucket = process.env.S3_BUCKET
  if (!bucket) return
  try {
    const list = await client().send(new ListObjectsV2Command({ Bucket: bucket, Prefix: 'incoming/', MaxKeys: 100 }))
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000
    for (const o of list.Contents ?? []) {
      if (o.Key && o.LastModified && o.LastModified.getTime() < dayAgo) {
        await client().send(new DeleteObjectCommand({ Bucket: bucket, Key: o.Key })).catch(() => {})
      }
    }
  } catch {}
}

/** Asks Supabase for a one-time upload URL for a new path under incoming/. */
export async function signUpload(name: string): Promise<{ url: string; path: string }> {
  const base = process.env.SUPABASE_URL!.replace(/\/$/, '')
  const bucket = process.env.S3_BUCKET!
  const path = `incoming/${crypto.randomUUID()}/${safeName(name)}`
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const res = await fetch(`${base}/storage/v1/object/upload/sign/${bucket}/${path}`, {
    method: 'POST',
    // New secret keys (sb_secret_...) go only in the apikey header; legacy service_role JWTs also as a Bearer token.
    headers: key.startsWith('sb_') ? { apikey: key, 'Content-Type': 'application/json' } : { Authorization: `Bearer ${key}`, apikey: key, 'Content-Type': 'application/json' },
    body: '{}',
  })
  if (!res.ok) throw new Error(`Could not create an upload URL (${res.status})`)
  const { url } = (await res.json()) as { url: string }
  return { url: `${base}/storage/v1${url}`, path }
}

export type ReadUpload = { name: string; type: string; size: number; data: Buffer }

/**
 * Turns a form value into file bytes: a File sent in the form, or "incoming:<path>" for a file the browser
 * uploaded to storage (which is then removed from incoming/). Returns null when nothing was chosen.
 */
export async function readUpload(entry: FormDataEntryValue | null, maxBytes: number): Promise<ReadUpload | null> {
  if (!entry) return null
  if (typeof entry !== 'string') {
    if (!entry.size) return null
    if (entry.size > maxBytes) throw new Error(`“${entry.name}” is larger than ${Math.round(maxBytes / 1048576)} MB.`)
    return { name: entry.name, type: entry.type || 'application/octet-stream', size: entry.size, data: Buffer.from(await entry.arrayBuffer()) }
  }
  if (!entry.startsWith(INCOMING)) return null
  const path = entry.slice(INCOMING.length)
  // Only our own random incoming/<uuid>/<name> paths are accepted.
  if (!/^incoming\/[0-9a-f-]{36}\/[\w.\-]+$/.test(path) || !directUploadsEnabled()) throw new Error('The uploaded file could not be found. Please choose it again.')
  const bucket = process.env.S3_BUCKET!
  try {
    const obj = await client().send(new GetObjectCommand({ Bucket: bucket, Key: path }))
    const size = Number(obj.ContentLength ?? 0)
    if (size > maxBytes) throw new Error(`The file is larger than ${Math.round(maxBytes / 1048576)} MB.`)
    const data = Buffer.from(await obj.Body!.transformToByteArray())
    return { name: path.split('/').pop()!, type: obj.ContentType || 'application/octet-stream', size: data.length, data }
  } finally {
    await client().send(new DeleteObjectCommand({ Bucket: bucket, Key: path })).catch(() => {})
  }
}
