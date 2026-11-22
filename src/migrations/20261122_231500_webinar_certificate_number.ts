import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Webinar certificates are numbered from 0001, and only the founder signs.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "webinar_certificates" ADD COLUMN IF NOT EXISTS "certificate_no" numeric;
  ALTER TABLE "webinar_certificates" ALTER COLUMN "left_name" DROP NOT NULL;
  ALTER TABLE "webinar_certificates" ALTER COLUMN "left_title" DROP NOT NULL;
  CREATE UNIQUE INDEX IF NOT EXISTS "webinar_certificates_certificate_no_idx" ON "webinar_certificates" USING btree ("certificate_no");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX IF EXISTS "webinar_certificates_certificate_no_idx";
  ALTER TABLE "webinar_certificates" DROP COLUMN IF EXISTS "certificate_no";
  UPDATE "webinar_certificates" SET "left_name" = '' WHERE "left_name" IS NULL;
  UPDATE "webinar_certificates" SET "left_title" = '' WHERE "left_title" IS NULL;
  ALTER TABLE "webinar_certificates" ALTER COLUMN "left_name" SET NOT NULL;
  ALTER TABLE "webinar_certificates" ALTER COLUMN "left_title" SET NOT NULL;
  `)
}
