import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_courses_access" AS ENUM('open', 'paid');
  ALTER TABLE "courses" ADD COLUMN "access" "enum_courses_access" DEFAULT 'open' NOT NULL;
  ALTER TABLE "courses" ADD COLUMN "tag_registration" boolean DEFAULT true;
  ALTER TYPE "public"."enum_courses_modules_lessons_type" ADD VALUE IF NOT EXISTS 'document';
  ALTER TABLE "courses_modules_lessons" ADD COLUMN "file_id" integer;
  ALTER TABLE "courses_modules_lessons" ADD CONSTRAINT "courses_modules_lessons_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "courses_modules_lessons_file_idx" ON "courses_modules_lessons" USING btree ("file_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX "courses_modules_lessons_file_idx";
  ALTER TABLE "courses_modules_lessons" DROP CONSTRAINT "courses_modules_lessons_file_id_media_id_fk";
  ALTER TABLE "courses_modules_lessons" DROP COLUMN "file_id";
  ALTER TABLE "courses" DROP COLUMN "tag_registration";
  ALTER TABLE "courses" DROP COLUMN "access";
  DROP TYPE "public"."enum_courses_access";
  `)
}
