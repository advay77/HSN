import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Advisory Board members, managed in Admin → Advisory Board. Adds the first two advisors (Dr. Karan Thakur, whose
// profile was on the page before, and Sonia Roschnik); their photos ship with the website (photo_path).
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "advisors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"badge" varchar DEFAULT 'Advisor',
  	"bio" varchar,
  	"photo_id" integer,
  	"photo_path" varchar,
  	"sort" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "advisors_id" integer;
  DO $$ BEGIN
    ALTER TABLE "advisors" ADD CONSTRAINT "advisors_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_advisors_fk" FOREIGN KEY ("advisors_id") REFERENCES "public"."advisors"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  CREATE INDEX IF NOT EXISTS "advisors_photo_idx" ON "advisors" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "advisors_updated_at_idx" ON "advisors" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "advisors_created_at_idx" ON "advisors" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_advisors_id_idx" ON "payload_locked_documents_rels" USING btree ("advisors_id");
  ALTER TABLE "advisors" ENABLE ROW LEVEL SECURITY;
  INSERT INTO "advisors" ("name", "role", "badge", "bio", "photo_path", "sort", "published")
    SELECT $adv$Dr. Karan Thakur$adv$, $adv$Group Vice President — Corporate Affairs, Sustainability & ESG, Apollo Hospitals Group$adv$, 'Advisor', $adv$Dr. Karan Thakur is Group Vice President — Corporate Affairs, Sustainability & ESG at Apollo Hospitals Group, where he leads the Group’s government and industry engagement alongside its Healthcare Sustainability & ESG agenda. Working at the intersection of health policy, global health diplomacy, and corporate sustainability, he is Apollo’s consistent point of contact across major international partnerships — including the World Economic Forum, the International Hospital Federation, and IFC’s EPiHC platform.

A seasoned healthcare administrator, he brings a broad range across health policy, hospital operations, projects, health communications, and sustainability & ESG strategy. He has advised the Asian Development Bank as a Technical Consultant on Climate & Health, serves as Senior Advisor to Scope Impact, and is an invited member of the Oxford Climate Leadership Centre.

His academic path spans the Harvard T.H. Chan School of Public Health, Manchester Business School at the University of Manchester, the Indian Institute of Management Bangalore, and National Law University, Delhi. He was India’s 2022 Global Fellow with the Eisenhower Fellowships — where he now sits on the India Nominating Committee — and a 2024 Chevening Gurukul Fellow for Leadership and Excellence at the University of Oxford.

Dr. Thakur holds a wide set of institutional roles: National Engagement Lead for PHFI’s Health & Environment Leadership Platform (H.E.L.P.), Co-Chair of CAHO’s Program on Sustainability (CAPS), and committee or advisory positions with ASSOCHAM, FICCI, the Health Sector Skills Council, the Goa Institute of Management’s Centre for Health Systems Design and Management, and the FORE School of Management.

He is the author of the Handbook of Healthcare Sustainability and ESG — the first practitioner-focused guide linking climate and health for hospital administrators — and, released in April 2026, The Connected Clinician, on how physicians can harness digital tools for professional growth.$adv$, '/images/advisors/karan-thakur.webp', 1, true
    WHERE NOT EXISTS (SELECT 1 FROM "advisors" WHERE "name" = 'Dr. Karan Thakur');
  INSERT INTO "advisors" ("name", "role", "badge", "bio", "photo_path", "sort", "published")
    SELECT $adv$Sonia Roschnik$adv$, $adv$Board Member, Climate Action Accelerator · Founding Executive Director, Geneva Sustainability Centre (International Hospital Federation)$adv$, 'Advisor', $adv$Sonia Roschnik is an international leader in sustainable healthcare and climate-resilient health systems, with over 30 years’ experience spanning clinical practice, hospital management, national policy and global health initiatives.

She was Founding Executive Director of the Geneva Sustainability Centre at the International Hospital Federation, Global Climate Policy Director at Health Care Without Harm, and Director of the NHS Sustainable Development Unit in England, where she helped shape national sustainability strategies and the foundations for the NHS net-zero programme.

Her work has focused on translating sustainability ambitions into practical actions, including developing leadership programmes, organisational assessment tools and international sustainability standards for healthcare.

Sonia currently advises international organisations on sustainable and resilient health systems and serves on the Board of Climate Action Accelerator. She holds an MSc in Systems Thinking in Practice.$adv$, '/images/advisors/sonia-roschnik.webp', 2, true
    WHERE NOT EXISTS (SELECT 1 FROM "advisors" WHERE "name" = 'Sonia Roschnik');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_advisors_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_advisors_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "advisors_id";
  DROP TABLE IF EXISTS "advisors" CASCADE;
  `)
}
