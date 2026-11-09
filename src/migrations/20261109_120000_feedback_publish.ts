import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Course feedback can be shown on the website: the learner's consent, and the admin's choice to show it.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "course_feedback" ADD COLUMN IF NOT EXISTS "share_publicly" boolean DEFAULT false;
  ALTER TABLE "course_feedback" ADD COLUMN IF NOT EXISTS "show_on_site" boolean DEFAULT false;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "course_feedback" DROP COLUMN IF EXISTS "show_on_site";
  ALTER TABLE "course_feedback" DROP COLUMN IF EXISTS "share_publicly";
  `)
}
