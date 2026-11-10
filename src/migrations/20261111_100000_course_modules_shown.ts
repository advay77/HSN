import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Course facts: the number of modules shown on the course page, set by the admin (empty = count automatically).
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "facts_modules" numeric;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "courses" DROP COLUMN IF EXISTS "facts_modules";
  `)
}
