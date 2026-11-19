import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Checklist and Policy/Program are separate from Toolkit. The new values are
// used by the next migration, after this one commits.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TYPE "public"."enum_library_resources_type" ADD VALUE IF NOT EXISTS 'Checklist';
  ALTER TYPE "public"."enum_library_resources_type" ADD VALUE IF NOT EXISTS 'Policy/Program';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`SELECT 1;`)
}
