import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Webinars (Resources → Webinars): title, date, speakers, and a YouTube link or an uploaded video.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "webinars" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"held_on" timestamp(3) with time zone NOT NULL,
  	"time" varchar,
  	"summary" varchar,
  	"youtube_url" varchar,
  	"video_id" integer,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  CREATE TABLE IF NOT EXISTS "webinars_speakers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"label" varchar DEFAULT 'Speaker',
  	"photo_id" integer
  );
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "webinars_id" integer;
  DO $$ BEGIN
    ALTER TABLE "webinars" ADD CONSTRAINT "webinars_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "webinars_speakers" ADD CONSTRAINT "webinars_speakers_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "webinars_speakers" ADD CONSTRAINT "webinars_speakers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."webinars"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_webinars_fk" FOREIGN KEY ("webinars_id") REFERENCES "public"."webinars"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  CREATE INDEX IF NOT EXISTS "webinars_held_on_idx" ON "webinars" USING btree ("held_on");
  CREATE INDEX IF NOT EXISTS "webinars_video_idx" ON "webinars" USING btree ("video_id");
  CREATE INDEX IF NOT EXISTS "webinars_updated_at_idx" ON "webinars" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "webinars_created_at_idx" ON "webinars" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "webinars_speakers_order_idx" ON "webinars_speakers" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "webinars_speakers_parent_id_idx" ON "webinars_speakers" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "webinars_speakers_photo_idx" ON "webinars_speakers" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_webinars_id_idx" ON "payload_locked_documents_rels" USING btree ("webinars_id");
  ALTER TABLE "webinars" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "webinars_speakers" ENABLE ROW LEVEL SECURITY;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_webinars_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_webinars_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "webinars_id";
  DROP TABLE IF EXISTS "webinars_speakers" CASCADE;
  DROP TABLE IF EXISTS "webinars" CASCADE;
  `)
}
