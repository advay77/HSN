import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// The rest of the public page wording (Home, Library, Get Involved, and the others) lives in one JSON field.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "site_copy" ADD COLUMN IF NOT EXISTS "pages" jsonb;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "site_copy" DROP COLUMN IF EXISTS "pages";`)
}
