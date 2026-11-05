import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Access and tutorial-file columns are already applied by 20261106_010000_course_access_documents.
// This migration only adds course feedback. Row level security blocks the Supabase Data API.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_course_feedback_overall_satisfaction" AS ENUM('excellent', 'good', 'average', 'below-average', 'poor');
  CREATE TYPE "public"."enum_course_feedback_recommend" AS ENUM('yes', 'maybe', 'no');
  CREATE TABLE "course_feedback" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"delegate_name" varchar NOT NULL,
  	"email" varchar,
  	"completion_date" timestamp(3) with time zone,
  	"course_title" varchar NOT NULL,
  	"course_id" integer,
  	"member_id" integer,
  	"overall_satisfaction" "enum_course_feedback_overall_satisfaction" NOT NULL,
  	"recommend" "enum_course_feedback_recommend" NOT NULL,
  	"objectives_clear" numeric NOT NULL,
  	"content_relevant" numeric NOT NULL,
  	"structured_logically" numeric NOT NULL,
  	"length_pace" numeric NOT NULL,
  	"examples_helpful" numeric NOT NULL,
  	"platform_easy" numeric NOT NULL,
  	"media_clear" numeric NOT NULL,
  	"quizzes_helpful" numeric NOT NULL,
  	"takeaway" varchar,
  	"application" varchar,
  	"future_topics" varchar,
  	"comments" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "course_feedback_id" integer;
  ALTER TABLE "course_feedback" ADD CONSTRAINT "course_feedback_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_feedback" ADD CONSTRAINT "course_feedback_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_course_feedback_fk" FOREIGN KEY ("course_feedback_id") REFERENCES "public"."course_feedback"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "course_feedback_course_idx" ON "course_feedback" USING btree ("course_id");
  CREATE INDEX "course_feedback_member_idx" ON "course_feedback" USING btree ("member_id");
  CREATE INDEX "course_feedback_updated_at_idx" ON "course_feedback" USING btree ("updated_at");
  CREATE INDEX "course_feedback_created_at_idx" ON "course_feedback" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_course_feedback_id_idx" ON "payload_locked_documents_rels" USING btree ("course_feedback_id");
  ALTER TABLE "course_feedback" ENABLE ROW LEVEL SECURITY;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_course_feedback_fk";
  DROP INDEX "payload_locked_documents_rels_course_feedback_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "course_feedback_id";
  ALTER TABLE "course_feedback" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "course_feedback" CASCADE;
  DROP TYPE "public"."enum_course_feedback_overall_satisfaction";
  DROP TYPE "public"."enum_course_feedback_recommend";
  `)
}
