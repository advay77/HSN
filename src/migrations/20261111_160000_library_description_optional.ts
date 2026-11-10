import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Library resources: the description is optional (HSN request, Nov 2026).
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "library_resources" ALTER COLUMN "description" DROP NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  UPDATE "library_resources" SET "description" = '' WHERE "description" IS NULL;
  ALTER TABLE "library_resources" ALTER COLUMN "description" SET NOT NULL;
  `)
}
