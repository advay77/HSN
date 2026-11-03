import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Supabase publishes the `public` schema through its Data API (PostgREST). Turning on row level security
// with no policies blocks that API from every table, while the website itself (connecting as the table
// owner `postgres`) is not affected. Tables added by later migrations: run this again (it is idempotent)
// or keep the Data API switched off for `public` (see SUPABASE-SETUP.md).
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    DECLARE t record;
    BEGIN
      FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
      END LOOP;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    DECLARE t record;
    BEGIN
      FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', t.tablename);
      END LOOP;
    END $$;
  `)
}
