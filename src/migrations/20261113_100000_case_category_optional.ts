import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Case studies: category is optional; members no longer choose it on the submit form (HSN request, Nov 2026).
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "case_studies" ALTER COLUMN "category" DROP NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  UPDATE "case_studies" SET "category" = 'Energy & Decarbonization' WHERE "category" IS NULL;
  ALTER TABLE "case_studies" ALTER COLUMN "category" SET NOT NULL;
  `)
}
