import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import fs from 'fs'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Activity, ClickEvents, PageViews } from './collections/Activity'
import { CaseStudies } from './collections/CaseStudies'
import { Courses } from './collections/Courses'
import { LibraryResources } from './collections/LibraryResources'
import { LoginCodes } from './collections/LoginCodes'
import { Media } from './collections/Media'
import { Members } from './collections/Members'
import { CourseFeedback, CourseRegistrations, Enrollments, MembershipApplications, SiteFeedback } from './collections/Submissions'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const databaseUrl = process.env.DATABASE_URL || ''
const usePostgres = databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://')

// Supabase signs its database certificate with its own CA, which Node doesn't know. With the CA (downloaded from
// Supabase → Database → SSL Configuration) the connection is encrypted AND verified. It comes from
// DATABASE_CA_CERT (the PEM text, for Vercel) or the file certs/supabase-ca.crt.
const caFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../certs/supabase-ca.crt')
const databaseCa = process.env.DATABASE_CA_CERT?.replace(/\\n/g, '\n') || (fs.existsSync(caFile) ? fs.readFileSync(caFile, 'utf8') : '')
// An sslmode in the URL would override the ssl settings below, so it is dropped when the CA is given.
const poolUrl = databaseCa ? databaseUrl.replace(/([?&])sslmode=[^&]*&?/, '$1').replace(/[?&]$/, '') : databaseUrl

// Uploads go to Supabase Storage (S3-compatible) when S3_BUCKET is set; otherwise to the local media/ folder.
const useS3 = Boolean(process.env.S3_BUCKET)

// Database: Postgres (Supabase) when DATABASE_URL starts with postgres://, otherwise a local SQLite file.
export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: { titleSuffix: ' · HSN CMS' },
  },
  // The designed HSN admin panel lives at /admin (src/app/(frontend)/admin). Payload's own screens move to /cms
  // as a fallback for raw data editing.
  routes: { admin: '/cms' },
  collections: [
    Courses,
    CaseStudies,
    LibraryResources,
    Media,
    Members,
    Enrollments,
    CourseRegistrations,
    CourseFeedback,
    SiteFeedback,
    MembershipApplications,
    LoginCodes,
    Activity,
    PageViews,
    ClickEvents,
    Users,
  ],
  // The site uses Payload's local API only; GraphQL is switched off to shrink the attack surface.
  graphQL: { disable: true },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: usePostgres
    ? postgresAdapter({
        pool: {
          connectionString: poolUrl,
          // At least 2: migrations hold one connection for their transaction and need another meanwhile.
          max: Math.max(2, Number(process.env.DATABASE_POOL_MAX || 10)),
          ...(databaseCa ? { ssl: { ca: databaseCa, rejectUnauthorized: true } } : {}),
        },
        // Schema changes reach production through migrations (npm run payload migrate), never automatic pushes.
        push: false,
        migrationDir: path.resolve(dirname, 'migrations'),
      })
    : sqliteAdapter({
        client: { url: databaseUrl },
      }),
  sharp,
  plugins: [
    s3Storage({
      enabled: useS3,
      collections: { media: true },
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'ap-south-1',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})
