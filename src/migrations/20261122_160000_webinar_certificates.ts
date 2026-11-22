import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Moderator and speaker certificates issued from the admin. Course certificates are unchanged.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_webinar_certificates_role" AS ENUM('moderator', 'speaker');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  CREATE TABLE IF NOT EXISTS "webinar_certificates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_webinar_certificates_role" NOT NULL,
  	"recipient" varchar NOT NULL,
  	"webinar" varchar NOT NULL,
  	"held_on" varchar NOT NULL,
  	"left_name" varchar NOT NULL,
  	"left_title" varchar NOT NULL,
  	"right_name" varchar NOT NULL,
  	"right_title" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "webinar_certificates_id" integer;
  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_webinar_certificates_fk" FOREIGN KEY ("webinar_certificates_id") REFERENCES "public"."webinar_certificates"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  CREATE INDEX IF NOT EXISTS "webinar_certificates_updated_at_idx" ON "webinar_certificates" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "webinar_certificates_created_at_idx" ON "webinar_certificates" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_webinar_certificates_id_idx" ON "payload_locked_documents_rels" USING btree ("webinar_certificates_id");
  ALTER TABLE "webinar_certificates" ENABLE ROW LEVEL SECURITY;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_webinar_certificates_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_webinar_certificates_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "webinar_certificates_id";
  DROP TABLE IF EXISTS "webinar_certificates" CASCADE;
  DROP TYPE IF EXISTS "public"."enum_webinar_certificates_role";
  `)
}
