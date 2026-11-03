import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_click_events_kind" AS ENUM('link', 'button');
  CREATE TABLE "click_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"path" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"target" varchar,
  	"kind" "enum_click_events_kind" DEFAULT 'link',
  	"member_id" integer,
  	"visitor" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "page_views" ADD COLUMN "from" varchar;
  ALTER TABLE "page_views" ADD COLUMN "referrer" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "click_events_id" integer;
  ALTER TABLE "click_events" ADD CONSTRAINT "click_events_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "click_events_path_idx" ON "click_events" USING btree ("path");
  CREATE INDEX "click_events_member_idx" ON "click_events" USING btree ("member_id");
  CREATE INDEX "click_events_visitor_idx" ON "click_events" USING btree ("visitor");
  CREATE INDEX "click_events_updated_at_idx" ON "click_events" USING btree ("updated_at");
  CREATE INDEX "click_events_created_at_idx" ON "click_events" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_click_events_fk" FOREIGN KEY ("click_events_id") REFERENCES "public"."click_events"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "page_views_referrer_idx" ON "page_views" USING btree ("referrer");
  CREATE INDEX "payload_locked_documents_rels_click_events_id_idx" ON "payload_locked_documents_rels" USING btree ("click_events_id");  -- Keep Supabase's Data API away from the new table (see 20261103_050000_enable_rls).
  ALTER TABLE "click_events" ENABLE ROW LEVEL SECURITY;
`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "click_events" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "click_events" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_click_events_fk";
  
  DROP INDEX "page_views_referrer_idx";
  DROP INDEX "payload_locked_documents_rels_click_events_id_idx";
  ALTER TABLE "page_views" DROP COLUMN "from";
  ALTER TABLE "page_views" DROP COLUMN "referrer";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "click_events_id";
  DROP TYPE "public"."enum_click_events_kind";`)
}
