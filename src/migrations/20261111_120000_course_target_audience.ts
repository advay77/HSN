import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// "Target audience" text on the course page, under the learning outcomes.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "target_audience" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "courses" DROP COLUMN IF EXISTS "target_audience";
  `)
}
