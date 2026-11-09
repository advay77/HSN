import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Fuller website feedback: ratings per area, likelihood to recommend, what people liked and want next.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "site_feedback" ADD COLUMN IF NOT EXISTS "aspects" jsonb;
  ALTER TABLE "site_feedback" ADD COLUMN IF NOT EXISTS "nps" numeric;
  ALTER TABLE "site_feedback" ADD COLUMN IF NOT EXISTS "role" varchar;
  ALTER TABLE "site_feedback" ADD COLUMN IF NOT EXISTS "source" varchar;
  ALTER TABLE "site_feedback" ADD COLUMN IF NOT EXISTS "liked" varchar;
  ALTER TABLE "site_feedback" ADD COLUMN IF NOT EXISTS "wants" jsonb;
  ALTER TABLE "site_feedback" ADD COLUMN IF NOT EXISTS "contact_ok" boolean DEFAULT false;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "site_feedback" DROP COLUMN IF EXISTS "contact_ok";
  ALTER TABLE "site_feedback" DROP COLUMN IF EXISTS "wants";
  ALTER TABLE "site_feedback" DROP COLUMN IF EXISTS "liked";
  ALTER TABLE "site_feedback" DROP COLUMN IF EXISTS "source";
  ALTER TABLE "site_feedback" DROP COLUMN IF EXISTS "role";
  ALTER TABLE "site_feedback" DROP COLUMN IF EXISTS "nps";
  ALTER TABLE "site_feedback" DROP COLUMN IF EXISTS "aspects";
  `)
}
