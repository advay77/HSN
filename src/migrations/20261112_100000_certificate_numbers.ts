import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Certificate numbers: a running number for each completed course (1, 2, 3…), shown in the certificate ID
// instead of the enrollment number. Courses already completed are numbered in the order they were completed.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "certificate_no" numeric;
  CREATE INDEX IF NOT EXISTS "enrollments_certificate_no_idx" ON "enrollments" USING btree ("certificate_no");
  UPDATE "enrollments" e SET "certificate_no" = r.n
    FROM (SELECT "id", row_number() OVER (ORDER BY "completed_at", "id") AS n FROM "enrollments" WHERE "completed_at" IS NOT NULL) r
    WHERE e."id" = r."id" AND e."certificate_no" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX IF EXISTS "enrollments_certificate_no_idx";
  ALTER TABLE "enrollments" DROP COLUMN IF EXISTS "certificate_no";
  `)
}
