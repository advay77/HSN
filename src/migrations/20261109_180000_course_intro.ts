import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Course introduction: the first step of every course, before Module 1 (text plus an uploaded video or a YouTube link).
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "intro_title" varchar;
  ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "intro_body" varchar;
  ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "intro_video_id" integer;
  ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "intro_youtube_id" varchar;
  DO $$ BEGIN
    ALTER TABLE "courses" ADD CONSTRAINT "courses_intro_video_id_media_id_fk" FOREIGN KEY ("intro_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  CREATE INDEX IF NOT EXISTS "courses_intro_intro_video_idx" ON "courses" USING btree ("intro_video_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX IF EXISTS "courses_intro_intro_video_idx";
  ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "courses_intro_video_id_media_id_fk";
  ALTER TABLE "courses" DROP COLUMN IF EXISTS "intro_youtube_id";
  ALTER TABLE "courses" DROP COLUMN IF EXISTS "intro_video_id";
  ALTER TABLE "courses" DROP COLUMN IF EXISTS "intro_body";
  ALTER TABLE "courses" DROP COLUMN IF EXISTS "intro_title";
  `)
}
