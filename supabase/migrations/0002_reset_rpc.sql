-- Stored proc for safe truncation
CREATE OR REPLACE FUNCTION demo_reset_tables()
RETURNS void AS $$
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

  -- Note: auth.users for demo accounts handled separately via admin API
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
