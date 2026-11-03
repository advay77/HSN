import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Activity, PageViews } from './collections/Activity'
import { CaseStudies } from './collections/CaseStudies'
import { Courses } from './collections/Courses'
import { LibraryResources } from './collections/LibraryResources'
import { LoginCodes } from './collections/LoginCodes'
import { Media } from './collections/Media'
import { Members } from './collections/Members'
import { CourseRegistrations, Enrollments, MembershipApplications } from './collections/Submissions'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const databaseUrl = process.env.DATABASE_URL || ''
const usePostgres = databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://')

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
    MembershipApplications,
    LoginCodes,
    Activity,
    PageViews,
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
        pool: { connectionString: databaseUrl, max: Number(process.env.DATABASE_POOL_MAX || 10) },
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
