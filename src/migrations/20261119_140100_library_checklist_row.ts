import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// The hospital vendor card is a checklist, not a toolkit.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  UPDATE "library_resources"
  SET "type" = 'Checklist'
  WHERE "title" ILIKE '%Hospital Vendor Sustainability Selection Checklist%';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  UPDATE "library_resources"
  SET "type" = 'Toolkit'
  WHERE "title" ILIKE '%Hospital Vendor Sustainability Selection Checklist%'
    AND "type" = 'Checklist';
  `)
}
