import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// HSN asked (11 Nov 2026) for the courses to be open to learners now: every "Coming soon" module becomes
// "Available". Hidden modules stay hidden. From now on the course-wide status in the admin editor controls this.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  UPDATE "courses_modules" SET "status" = 'available' WHERE "status" = 'coming-soon';
  `)
}

// Nothing to undo automatically: which modules were "Coming soon" before is not recorded.
// Set the course status back in the admin editor if needed.
export async function down(_args: MigrateDownArgs): Promise<void> {}
