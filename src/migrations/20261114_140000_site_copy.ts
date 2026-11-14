import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Page wording edited in Admin → Page text. The first row is created when the admin saves.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "site_copy" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"about_intro" varchar,
  	"mission" varchar,
  	"purpose" varchar,
  	"story" varchar,
  	"team" varchar,
  	"services" jsonb,
  	"case_studies_title" varchar,
  	"case_studies_menu" varchar,
  	"case_studies_intro" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "site_copy_id" integer;
  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_copy_fk" FOREIGN KEY ("site_copy_id") REFERENCES "public"."site_copy"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  CREATE INDEX IF NOT EXISTS "site_copy_updated_at_idx" ON "site_copy" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "site_copy_created_at_idx" ON "site_copy" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_site_copy_id_idx" ON "payload_locked_documents_rels" USING btree ("site_copy_id");
  ALTER TABLE "site_copy" ENABLE ROW LEVEL SECURITY;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_site_copy_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_site_copy_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "site_copy_id";
  DROP TABLE IF EXISTS "site_copy" CASCADE;
  `)
}
