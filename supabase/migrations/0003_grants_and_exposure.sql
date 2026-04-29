-- =====================================================
-- 0003: Grants + PostgREST schema exposure
-- =====================================================
-- The `demo` schema must be reachable by the PostgREST API roles
-- (anon, authenticated, service_role). This migration grants
-- USAGE on the schema and the necessary table/sequence/function
-- privileges. RLS policies remain authoritative for row-level access.
--
-- IMPORTANT (managed Supabase only):
-- After running this migration, also expose the `demo` schema by
-- going to Project Settings → API → Exposed schemas, and adding
-- `demo` alongside `public, graphql_public`. Without that step,
-- PostgREST returns "schema demo not exposed".
-- For local stacks, edit supabase/config.toml [api] schemas to
-- include "demo".
-- =====================================================

GRANT USAGE ON SCHEMA demo TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA demo TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA demo TO authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA demo TO authenticated, service_role;

-- Anonymous access is read-only (RLS still enforces row visibility)
GRANT SELECT ON ALL TABLES IN SCHEMA demo TO anon;

-- Future tables created in the demo schema inherit the same grants
ALTER DEFAULT PRIVILEGES IN SCHEMA demo
  GRANT ALL ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA demo
  GRANT ALL ON SEQUENCES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA demo
  GRANT EXECUTE ON FUNCTIONS TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA demo
  GRANT SELECT ON TABLES TO anon;

-- =====================================================
-- Make audit trigger null-safe + harden SECURITY DEFINER
-- functions with an explicit search_path.
-- =====================================================

CREATE OR REPLACE FUNCTION demo.audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  actor_email_value TEXT;
BEGIN
  BEGIN
    actor_email_value := auth.email();
  EXCEPTION WHEN OTHERS THEN
    actor_email_value := NULL;
  END;

  INSERT INTO demo.audit_log (
    org_id, actor_id, actor_email, action, entity_type, entity_id,
    before_state, after_state
  ) VALUES (
    COALESCE(NEW.org_id, OLD.org_id),
    auth.uid(),
    COALESCE(actor_email_value, '<system>'),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION demo.current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT role FROM demo.user_profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION demo.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT demo.current_user_role() = 'admin';
$$;

CREATE OR REPLACE FUNCTION demo.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION demo_reset_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  TRUNCATE TABLE
    demo.media,
    demo.observations,
    demo.jar_entries,
    demo.stage_entries,
    demo.batches,
    demo.forecasts,
    demo.permissions,
    demo.user_profiles,
    demo.audit_log,
    demo.observation_types,
    demo.stages,
    demo.varieties
  CASCADE;
END;
$$;

GRANT EXECUTE ON FUNCTION demo_reset_tables() TO authenticated, service_role;

-- Reload the PostgREST schema cache so newly granted relations are visible
NOTIFY pgrst, 'reload schema';
