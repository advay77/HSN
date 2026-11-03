import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_courses_modules_lessons_type" AS ENUM('cover', 'text', 'reflection', 'diagram', 'video', 'references', 'summary', 'quiz');
  CREATE TYPE "public"."enum_courses_modules_status" AS ENUM('available', 'coming-soon', 'hidden');
  CREATE TYPE "public"."enum_courses_level" AS ENUM('Beginner', 'Intermediate', 'Advanced');
  CREATE TYPE "public"."enum_courses_kind" AS ENUM('Full course', 'Micro-course');
  CREATE TYPE "public"."enum_courses_cover_color" AS ENUM('#134E5E', '#0B6B3A', '#4FAE4E', '#DDF0F6', '#E3F1E4');
  CREATE TYPE "public"."enum_courses_audience" AS ENUM('everyone', 'members');
  CREATE TYPE "public"."enum_case_studies_status" AS ENUM('submitted', 'draft', 'published', 'returned', 'rejected');
  CREATE TYPE "public"."enum_case_studies_category" AS ENUM('Energy & Decarbonization', 'Clinical Care & SusQI', 'Waste Minimization', 'Procurement & Logistics');
  CREATE TYPE "public"."enum_case_studies_region" AS ENUM('India', 'GCC', 'International');
  CREATE TYPE "public"."enum_case_studies_color" AS ENUM('#134E5E', '#4FAE4E', '#5BC0E3', '#0B6B3A');
  CREATE TYPE "public"."enum_library_resources_type" AS ENUM('Guide', 'Toolkit', 'Report', 'Template');
  CREATE TYPE "public"."enum_library_resources_access" AS ENUM('free', 'members');
  CREATE TYPE "public"."enum_members_membership_tier" AS ENUM('student', 'individual', 'institutional');
  CREATE TYPE "public"."enum_members_membership_status" AS ENUM('none', 'pending', 'active', 'expired');
  CREATE TYPE "public"."enum_members_auth_provider" AS ENUM('google', 'email');
  CREATE TYPE "public"."enum_members_last_login_method" AS ENUM('google', 'email');
  CREATE TYPE "public"."enum_membership_applications_tier" AS ENUM('student', 'individual', 'institutional');
  CREATE TYPE "public"."enum_membership_applications_payment_status" AS ENUM('free', 'pending', 'paid', 'failed');
  CREATE TYPE "public"."enum_login_codes_scope" AS ENUM('member', 'admin');
  CREATE TYPE "public"."enum_activity_type" AS ENUM('login', 'signup', 'lesson', 'quiz-pass', 'course-complete', 'course-registration', 'case-submitted', 'membership');
  CREATE TABLE "courses_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "courses_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "courses_outcomes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "courses_skills" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "courses_modules_lessons_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"url" varchar,
  	"link_text" varchar
  );
  
  CREATE TABLE "courses_modules_lessons_questions_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"correct" boolean DEFAULT false
  );
  
  CREATE TABLE "courses_modules_lessons_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar
  );
  
  CREATE TABLE "courses_modules_lessons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"type" "enum_courses_modules_lessons_type" DEFAULT 'text' NOT NULL,
  	"body" varchar,
  	"extra" varchar,
  	"image_id" integer,
  	"youtube_id" varchar,
  	"draft_questions" boolean DEFAULT false
  );
  
  CREATE TABLE "courses_modules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"status" "enum_courses_modules_status" DEFAULT 'available' NOT NULL,
  	"slides_id" integer
  );
  
  CREATE TABLE "courses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"description" varchar NOT NULL,
  	"level" "enum_courses_level" DEFAULT 'Beginner' NOT NULL,
  	"kind" "enum_courses_kind" DEFAULT 'Full course' NOT NULL,
  	"created_by" varchar DEFAULT 'Healthcare Sustainability Network',
  	"tag_self_paced" boolean DEFAULT true,
  	"tag_video" boolean,
  	"cover_id" integer,
  	"cover_badge" varchar,
  	"cover_color" "enum_courses_cover_color" DEFAULT '#134E5E',
  	"facts_duration" varchar,
  	"facts_language" varchar DEFAULT 'English',
  	"facts_language_note" varchar DEFAULT 'Hindi and Arabic coming soon',
  	"learn_intro" varchar,
  	"about" varchar,
  	"certificate_enabled" boolean DEFAULT true,
  	"certificate_heading" varchar,
  	"certificate_text" varchar,
  	"certificate_step1" varchar,
  	"certificate_step2" varchar,
  	"certificate_step3" varchar,
  	"certificate_pass_mark" numeric DEFAULT 80,
  	"certificate_retakes" boolean DEFAULT true,
  	"certificate_max_attempts" numeric DEFAULT 0,
  	"certificate_issuer" varchar DEFAULT 'Healthcare Sustainability Network',
  	"published" boolean DEFAULT false,
  	"featured" boolean DEFAULT false,
  	"audience" "enum_courses_audience" DEFAULT 'everyone',
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "case_studies_impacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "case_studies_sections_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "case_studies_sections_table_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"dimension" varchar NOT NULL,
  	"measure" varchar NOT NULL,
  	"result" varchar NOT NULL
  );
  
  CREATE TABLE "case_studies_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"lead" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "case_studies_lessons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "case_studies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"status" "enum_case_studies_status" DEFAULT 'draft' NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"review_note" varchar,
  	"reviewed_at" timestamp(3) with time zone,
  	"category" "enum_case_studies_category" NOT NULL,
  	"region" "enum_case_studies_region",
  	"country" varchar,
  	"organization" varchar,
  	"color" "enum_case_studies_color" DEFAULT '#134E5E',
  	"summary" varchar NOT NULL,
  	"image_id" integer,
  	"image_caption" varchar,
  	"patient_safety" varchar,
  	"pdf_id" integer,
  	"submitted_by_name" varchar,
  	"submitted_by_email" varchar,
  	"submitted_by_role" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "case_studies_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "library_resources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"type" "enum_library_resources_type" NOT NULL,
  	"access" "enum_library_resources_access" DEFAULT 'free' NOT NULL,
  	"description" varchar NOT NULL,
  	"format" varchar,
  	"size" varchar,
  	"file_id" integer,
  	"external_url" varchar,
  	"published" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"private" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone_country_code" varchar,
  	"phone" varchar,
  	"role" varchar,
  	"organization" varchar,
  	"country" varchar,
  	"join_network" boolean DEFAULT false,
  	"membership_tier" "enum_members_membership_tier",
  	"membership_status" "enum_members_membership_status" DEFAULT 'none',
  	"auth_provider" "enum_members_auth_provider",
  	"google_id" varchar,
  	"last_login_at" timestamp(3) with time zone,
  	"last_login_method" "enum_members_last_login_method",
  	"last_seen_at" timestamp(3) with time zone,
  	"session_version" numeric DEFAULT 0,
  	"blocked" boolean DEFAULT false,
  	"admin_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "enrollments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_id" integer NOT NULL,
  	"course_id" integer NOT NULL,
  	"completed_lessons" jsonb,
  	"quiz_results" jsonb,
  	"progress" numeric DEFAULT 0,
  	"saved_for_later" boolean DEFAULT false,
  	"completed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "course_registrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"role" varchar,
  	"organization" varchar,
  	"country" varchar,
  	"session" varchar,
  	"join_network" boolean DEFAULT false,
  	"course_id" integer,
  	"member_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "membership_applications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"organization" varchar,
  	"role" varchar,
  	"tier" "enum_membership_applications_tier" NOT NULL,
  	"country" varchar,
  	"region" varchar,
  	"message" varchar,
  	"member_id" integer,
  	"payment_status" "enum_membership_applications_payment_status" DEFAULT 'free',
  	"payment_provider" varchar,
  	"payment_reference" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "login_codes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"scope" "enum_login_codes_scope" DEFAULT 'member',
  	"code_hash" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"attempts" numeric DEFAULT 0,
  	"used" boolean DEFAULT false,
  	"name" varchar,
  	"join_network" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "activity" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_activity_type" NOT NULL,
  	"member_id" integer,
  	"detail" varchar,
  	"meta" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "page_views" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"section" varchar NOT NULL,
  	"path" varchar,
  	"seconds" numeric DEFAULT 0,
  	"member_id" integer,
  	"visitor" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"session_version" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"courses_id" integer,
  	"case_studies_id" integer,
  	"library_resources_id" integer,
  	"media_id" integer,
  	"members_id" integer,
  	"enrollments_id" integer,
  	"course_registrations_id" integer,
  	"membership_applications_id" integer,
  	"login_codes_id" integer,
  	"activity_id" integer,
  	"page_views_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "courses_tags" ADD CONSTRAINT "courses_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_sessions" ADD CONSTRAINT "courses_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_outcomes" ADD CONSTRAINT "courses_outcomes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_skills" ADD CONSTRAINT "courses_skills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_modules_lessons_references" ADD CONSTRAINT "courses_modules_lessons_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses_modules_lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_modules_lessons_questions_options" ADD CONSTRAINT "courses_modules_lessons_questions_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses_modules_lessons_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_modules_lessons_questions" ADD CONSTRAINT "courses_modules_lessons_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses_modules_lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_modules_lessons" ADD CONSTRAINT "courses_modules_lessons_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_modules_lessons" ADD CONSTRAINT "courses_modules_lessons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_modules" ADD CONSTRAINT "courses_modules_slides_id_media_id_fk" FOREIGN KEY ("slides_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_modules" ADD CONSTRAINT "courses_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies_impacts" ADD CONSTRAINT "case_studies_impacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_sections_bullets" ADD CONSTRAINT "case_studies_sections_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_sections_table_rows" ADD CONSTRAINT "case_studies_sections_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_sections" ADD CONSTRAINT "case_studies_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_lessons" ADD CONSTRAINT "case_studies_lessons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_pdf_id_media_id_fk" FOREIGN KEY ("pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies_rels" ADD CONSTRAINT "case_studies_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_rels" ADD CONSTRAINT "case_studies_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "library_resources" ADD CONSTRAINT "library_resources_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_registrations" ADD CONSTRAINT "course_registrations_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "course_registrations" ADD CONSTRAINT "course_registrations_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "membership_applications" ADD CONSTRAINT "membership_applications_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activity" ADD CONSTRAINT "activity_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_views" ADD CONSTRAINT "page_views_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_library_resources_fk" FOREIGN KEY ("library_resources_id") REFERENCES "public"."library_resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enrollments_fk" FOREIGN KEY ("enrollments_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_course_registrations_fk" FOREIGN KEY ("course_registrations_id") REFERENCES "public"."course_registrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_membership_applications_fk" FOREIGN KEY ("membership_applications_id") REFERENCES "public"."membership_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_login_codes_fk" FOREIGN KEY ("login_codes_id") REFERENCES "public"."login_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_activity_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activity"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_page_views_fk" FOREIGN KEY ("page_views_id") REFERENCES "public"."page_views"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "courses_tags_order_idx" ON "courses_tags" USING btree ("_order");
  CREATE INDEX "courses_tags_parent_id_idx" ON "courses_tags" USING btree ("_parent_id");
  CREATE INDEX "courses_sessions_order_idx" ON "courses_sessions" USING btree ("_order");
  CREATE INDEX "courses_sessions_parent_id_idx" ON "courses_sessions" USING btree ("_parent_id");
  CREATE INDEX "courses_outcomes_order_idx" ON "courses_outcomes" USING btree ("_order");
  CREATE INDEX "courses_outcomes_parent_id_idx" ON "courses_outcomes" USING btree ("_parent_id");
  CREATE INDEX "courses_skills_order_idx" ON "courses_skills" USING btree ("_order");
  CREATE INDEX "courses_skills_parent_id_idx" ON "courses_skills" USING btree ("_parent_id");
  CREATE INDEX "courses_modules_lessons_references_order_idx" ON "courses_modules_lessons_references" USING btree ("_order");
  CREATE INDEX "courses_modules_lessons_references_parent_id_idx" ON "courses_modules_lessons_references" USING btree ("_parent_id");
  CREATE INDEX "courses_modules_lessons_questions_options_order_idx" ON "courses_modules_lessons_questions_options" USING btree ("_order");
  CREATE INDEX "courses_modules_lessons_questions_options_parent_id_idx" ON "courses_modules_lessons_questions_options" USING btree ("_parent_id");
  CREATE INDEX "courses_modules_lessons_questions_order_idx" ON "courses_modules_lessons_questions" USING btree ("_order");
  CREATE INDEX "courses_modules_lessons_questions_parent_id_idx" ON "courses_modules_lessons_questions" USING btree ("_parent_id");
  CREATE INDEX "courses_modules_lessons_order_idx" ON "courses_modules_lessons" USING btree ("_order");
  CREATE INDEX "courses_modules_lessons_parent_id_idx" ON "courses_modules_lessons" USING btree ("_parent_id");
  CREATE INDEX "courses_modules_lessons_image_idx" ON "courses_modules_lessons" USING btree ("image_id");
  CREATE INDEX "courses_modules_order_idx" ON "courses_modules" USING btree ("_order");
  CREATE INDEX "courses_modules_parent_id_idx" ON "courses_modules" USING btree ("_parent_id");
  CREATE INDEX "courses_modules_slides_idx" ON "courses_modules" USING btree ("slides_id");
  CREATE UNIQUE INDEX "courses_slug_idx" ON "courses" USING btree ("slug");
  CREATE INDEX "courses_cover_idx" ON "courses" USING btree ("cover_id");
  CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");
  CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");
  CREATE INDEX "case_studies_impacts_order_idx" ON "case_studies_impacts" USING btree ("_order");
  CREATE INDEX "case_studies_impacts_parent_id_idx" ON "case_studies_impacts" USING btree ("_parent_id");
  CREATE INDEX "case_studies_sections_bullets_order_idx" ON "case_studies_sections_bullets" USING btree ("_order");
  CREATE INDEX "case_studies_sections_bullets_parent_id_idx" ON "case_studies_sections_bullets" USING btree ("_parent_id");
  CREATE INDEX "case_studies_sections_table_rows_order_idx" ON "case_studies_sections_table_rows" USING btree ("_order");
  CREATE INDEX "case_studies_sections_table_rows_parent_id_idx" ON "case_studies_sections_table_rows" USING btree ("_parent_id");
  CREATE INDEX "case_studies_sections_order_idx" ON "case_studies_sections" USING btree ("_order");
  CREATE INDEX "case_studies_sections_parent_id_idx" ON "case_studies_sections" USING btree ("_parent_id");
  CREATE INDEX "case_studies_lessons_order_idx" ON "case_studies_lessons" USING btree ("_order");
  CREATE INDEX "case_studies_lessons_parent_id_idx" ON "case_studies_lessons" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "case_studies_slug_idx" ON "case_studies" USING btree ("slug");
  CREATE INDEX "case_studies_image_idx" ON "case_studies" USING btree ("image_id");
  CREATE INDEX "case_studies_pdf_idx" ON "case_studies" USING btree ("pdf_id");
  CREATE INDEX "case_studies_updated_at_idx" ON "case_studies" USING btree ("updated_at");
  CREATE INDEX "case_studies_created_at_idx" ON "case_studies" USING btree ("created_at");
  CREATE INDEX "case_studies_rels_order_idx" ON "case_studies_rels" USING btree ("order");
  CREATE INDEX "case_studies_rels_parent_idx" ON "case_studies_rels" USING btree ("parent_id");
  CREATE INDEX "case_studies_rels_path_idx" ON "case_studies_rels" USING btree ("path");
  CREATE INDEX "case_studies_rels_media_id_idx" ON "case_studies_rels" USING btree ("media_id");
  CREATE INDEX "library_resources_file_idx" ON "library_resources" USING btree ("file_id");
  CREATE INDEX "library_resources_updated_at_idx" ON "library_resources" USING btree ("updated_at");
  CREATE INDEX "library_resources_created_at_idx" ON "library_resources" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "members_email_idx" ON "members" USING btree ("email");
  CREATE INDEX "members_google_id_idx" ON "members" USING btree ("google_id");
  CREATE INDEX "members_last_seen_at_idx" ON "members" USING btree ("last_seen_at");
  CREATE INDEX "members_updated_at_idx" ON "members" USING btree ("updated_at");
  CREATE INDEX "members_created_at_idx" ON "members" USING btree ("created_at");
  CREATE INDEX "enrollments_member_idx" ON "enrollments" USING btree ("member_id");
  CREATE INDEX "enrollments_course_idx" ON "enrollments" USING btree ("course_id");
  CREATE INDEX "enrollments_updated_at_idx" ON "enrollments" USING btree ("updated_at");
  CREATE INDEX "enrollments_created_at_idx" ON "enrollments" USING btree ("created_at");
  CREATE INDEX "course_registrations_course_idx" ON "course_registrations" USING btree ("course_id");
  CREATE INDEX "course_registrations_member_idx" ON "course_registrations" USING btree ("member_id");
  CREATE INDEX "course_registrations_updated_at_idx" ON "course_registrations" USING btree ("updated_at");
  CREATE INDEX "course_registrations_created_at_idx" ON "course_registrations" USING btree ("created_at");
  CREATE INDEX "membership_applications_member_idx" ON "membership_applications" USING btree ("member_id");
  CREATE INDEX "membership_applications_updated_at_idx" ON "membership_applications" USING btree ("updated_at");
  CREATE INDEX "membership_applications_created_at_idx" ON "membership_applications" USING btree ("created_at");
  CREATE INDEX "login_codes_email_idx" ON "login_codes" USING btree ("email");
  CREATE INDEX "login_codes_scope_idx" ON "login_codes" USING btree ("scope");
  CREATE INDEX "login_codes_updated_at_idx" ON "login_codes" USING btree ("updated_at");
  CREATE INDEX "login_codes_created_at_idx" ON "login_codes" USING btree ("created_at");
  CREATE INDEX "activity_type_idx" ON "activity" USING btree ("type");
  CREATE INDEX "activity_member_idx" ON "activity" USING btree ("member_id");
  CREATE INDEX "activity_updated_at_idx" ON "activity" USING btree ("updated_at");
  CREATE INDEX "activity_created_at_idx" ON "activity" USING btree ("created_at");
  CREATE INDEX "page_views_section_idx" ON "page_views" USING btree ("section");
  CREATE INDEX "page_views_member_idx" ON "page_views" USING btree ("member_id");
  CREATE INDEX "page_views_visitor_idx" ON "page_views" USING btree ("visitor");
  CREATE INDEX "page_views_updated_at_idx" ON "page_views" USING btree ("updated_at");
  CREATE INDEX "page_views_created_at_idx" ON "page_views" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" USING btree ("courses_id");
  CREATE INDEX "payload_locked_documents_rels_case_studies_id_idx" ON "payload_locked_documents_rels" USING btree ("case_studies_id");
  CREATE INDEX "payload_locked_documents_rels_library_resources_id_idx" ON "payload_locked_documents_rels" USING btree ("library_resources_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_members_id_idx" ON "payload_locked_documents_rels" USING btree ("members_id");
  CREATE INDEX "payload_locked_documents_rels_enrollments_id_idx" ON "payload_locked_documents_rels" USING btree ("enrollments_id");
  CREATE INDEX "payload_locked_documents_rels_course_registrations_id_idx" ON "payload_locked_documents_rels" USING btree ("course_registrations_id");
  CREATE INDEX "payload_locked_documents_rels_membership_applications_id_idx" ON "payload_locked_documents_rels" USING btree ("membership_applications_id");
  CREATE INDEX "payload_locked_documents_rels_login_codes_id_idx" ON "payload_locked_documents_rels" USING btree ("login_codes_id");
  CREATE INDEX "payload_locked_documents_rels_activity_id_idx" ON "payload_locked_documents_rels" USING btree ("activity_id");
  CREATE INDEX "payload_locked_documents_rels_page_views_id_idx" ON "payload_locked_documents_rels" USING btree ("page_views_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "courses_tags" CASCADE;
  DROP TABLE "courses_sessions" CASCADE;
  DROP TABLE "courses_outcomes" CASCADE;
  DROP TABLE "courses_skills" CASCADE;
  DROP TABLE "courses_modules_lessons_references" CASCADE;
  DROP TABLE "courses_modules_lessons_questions_options" CASCADE;
  DROP TABLE "courses_modules_lessons_questions" CASCADE;
  DROP TABLE "courses_modules_lessons" CASCADE;
  DROP TABLE "courses_modules" CASCADE;
  DROP TABLE "courses" CASCADE;
  DROP TABLE "case_studies_impacts" CASCADE;
  DROP TABLE "case_studies_sections_bullets" CASCADE;
  DROP TABLE "case_studies_sections_table_rows" CASCADE;
  DROP TABLE "case_studies_sections" CASCADE;
  DROP TABLE "case_studies_lessons" CASCADE;
  DROP TABLE "case_studies" CASCADE;
  DROP TABLE "case_studies_rels" CASCADE;
  DROP TABLE "library_resources" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "members" CASCADE;
  DROP TABLE "enrollments" CASCADE;
  DROP TABLE "course_registrations" CASCADE;
  DROP TABLE "membership_applications" CASCADE;
  DROP TABLE "login_codes" CASCADE;
  DROP TABLE "activity" CASCADE;
  DROP TABLE "page_views" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_courses_modules_lessons_type";
  DROP TYPE "public"."enum_courses_modules_status";
  DROP TYPE "public"."enum_courses_level";
  DROP TYPE "public"."enum_courses_kind";
  DROP TYPE "public"."enum_courses_cover_color";
  DROP TYPE "public"."enum_courses_audience";
  DROP TYPE "public"."enum_case_studies_status";
  DROP TYPE "public"."enum_case_studies_category";
  DROP TYPE "public"."enum_case_studies_region";
  DROP TYPE "public"."enum_case_studies_color";
  DROP TYPE "public"."enum_library_resources_type";
  DROP TYPE "public"."enum_library_resources_access";
  DROP TYPE "public"."enum_members_membership_tier";
  DROP TYPE "public"."enum_members_membership_status";
  DROP TYPE "public"."enum_members_auth_provider";
  DROP TYPE "public"."enum_members_last_login_method";
  DROP TYPE "public"."enum_membership_applications_tier";
  DROP TYPE "public"."enum_membership_applications_payment_status";
  DROP TYPE "public"."enum_login_codes_scope";
  DROP TYPE "public"."enum_activity_type";`)
}
