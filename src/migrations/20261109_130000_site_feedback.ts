import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Website feedback form (Home, About and /feedback). Row level security blocks the Supabase Data API.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_site_feedback_rating" AS ENUM('5', '4', '3', '2', '1');
  CREATE TABLE "site_feedback" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"email" varchar,
  	"rating" "enum_site_feedback_rating",
  	"message" varchar NOT NULL,
  	"page" varchar,
  	"member_id" integer,
  	"read" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "site_feedback_id" integer;
  ALTER TABLE "site_feedback" ADD CONSTRAINT "site_feedback_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_feedback_fk" FOREIGN KEY ("site_feedback_id") REFERENCES "public"."site_feedback"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_feedback_member_idx" ON "site_feedback" USING btree ("member_id");
  CREATE INDEX "site_feedback_updated_at_idx" ON "site_feedback" USING btree ("updated_at");
  CREATE INDEX "site_feedback_created_at_idx" ON "site_feedback" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_site_feedback_id_idx" ON "payload_locked_documents_rels" USING btree ("site_feedback_id");
  ALTER TABLE "site_feedback" ENABLE ROW LEVEL SECURITY;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_site_feedback_fk";
  DROP INDEX "payload_locked_documents_rels_site_feedback_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "site_feedback_id";
  DROP TABLE "site_feedback" CASCADE;
  DROP TYPE "public"."enum_site_feedback_rating";
  `)
}
