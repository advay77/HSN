import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Our Team members, managed in Admin → Our Team. Two sample profiles so the page has something to show
// until real people are added; they can be edited or deleted from the admin.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "team_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"section" varchar DEFAULT 'Core team',
  	"bio" varchar,
  	"photo_id" integer,
  	"sort" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "team_members_id" integer;
  DO $$ BEGIN
    ALTER TABLE "team_members" ADD CONSTRAINT "team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  CREATE INDEX IF NOT EXISTS "team_members_photo_idx" ON "team_members" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "team_members_updated_at_idx" ON "team_members" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "team_members_created_at_idx" ON "team_members" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_team_members_id_idx" ON "payload_locked_documents_rels" USING btree ("team_members_id");
  ALTER TABLE "team_members" ENABLE ROW LEVEL SECURITY;
  INSERT INTO "team_members" ("name", "role", "section", "bio", "sort", "published")
    SELECT 'Asha Menon', 'Programme Lead', 'Core team', $tm$This is a sample profile, so the Our Team page has someone to show. Replace the name, role, photo and intro from Admin → Our Team, or delete this profile and add the real people.

Asha’s sample intro is a second paragraph, the way a longer bio will read when a visitor opens the profile.$tm$, 1, true
    WHERE NOT EXISTS (SELECT 1 FROM "team_members" WHERE "name" = 'Asha Menon');
  INSERT INTO "team_members" ("name", "role", "section", "bio", "sort", "published")
    SELECT 'Priya Nair', 'Project Coordinator', 'Core team', $tm$This is a second sample profile. Replace the name, role, photo and intro from Admin → Our Team, or delete this profile once the real team is added.$tm$, 2, true
    WHERE NOT EXISTS (SELECT 1 FROM "team_members" WHERE "name" = 'Priya Nair');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_team_members_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_team_members_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "team_members_id";
  DROP TABLE IF EXISTS "team_members" CASCADE;
  `)
}
