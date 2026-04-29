-- =====================================================
-- 4.2.1 Enable RLS on all tables
-- =====================================================

ALTER TABLE demo.varieties ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.observation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.stage_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.jar_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo.forecasts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4.2.2 Helper Functions
-- =====================================================

CREATE OR REPLACE FUNCTION demo.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM demo.user_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION demo.is_admin()
RETURNS BOOLEAN AS $$
  SELECT demo.current_user_role() = 'admin';
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- =====================================================
-- 4.2.3 Policies: Reference Tables (read-all for authenticated)
-- =====================================================

CREATE POLICY "ref_read" ON demo.varieties FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "ref_read" ON demo.stages FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "ref_read" ON demo.observation_types FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "ref_admin_write" ON demo.varieties FOR ALL TO authenticated
  USING (demo.is_admin()) WITH CHECK (demo.is_admin());
CREATE POLICY "ref_admin_write" ON demo.stages FOR ALL TO authenticated
  USING (demo.is_admin()) WITH CHECK (demo.is_admin());
CREATE POLICY "ref_admin_write" ON demo.observation_types FOR ALL TO authenticated
  USING (demo.is_admin()) WITH CHECK (demo.is_admin());

-- =====================================================
-- 4.2.4 Policies: Batches
-- =====================================================

CREATE POLICY "batches_read_all" ON demo.batches FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "batches_write_scientist_admin" ON demo.batches FOR INSERT TO authenticated
  WITH CHECK (demo.current_user_role() IN ('admin','scientist','production_manager'));
CREATE POLICY "batches_update_scientist_admin" ON demo.batches FOR UPDATE TO authenticated
  USING (demo.current_user_role() IN ('admin','scientist','production_manager'));
CREATE POLICY "batches_delete_admin" ON demo.batches FOR DELETE TO authenticated
  USING (demo.is_admin());

-- =====================================================
-- 4.2.5 Policies: Stage Entries
-- =====================================================

CREATE POLICY "stage_entries_read_all" ON demo.stage_entries FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "stage_entries_write" ON demo.stage_entries FOR INSERT TO authenticated
  WITH CHECK (demo.current_user_role() IN ('admin','scientist','production_manager'));
CREATE POLICY "stage_entries_update_own_or_admin" ON demo.stage_entries FOR UPDATE TO authenticated
  USING (operator_id = auth.uid() OR demo.is_admin());
CREATE POLICY "stage_entries_delete_admin" ON demo.stage_entries FOR DELETE TO authenticated
  USING (demo.is_admin());

-- Same pattern applies to jar_entries, observations, media (read-all, role-based write)
CREATE POLICY "jar_entries_read_all" ON demo.jar_entries FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "jar_entries_write" ON demo.jar_entries FOR ALL TO authenticated
  USING (demo.current_user_role() IN ('admin','scientist','production_manager'));

CREATE POLICY "observations_read_all" ON demo.observations FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "observations_write" ON demo.observations FOR ALL TO authenticated
  USING (demo.current_user_role() IN ('admin','scientist','qc_lead','production_manager'));

CREATE POLICY "media_read_all" ON demo.media FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "media_write" ON demo.media FOR ALL TO authenticated
  USING (demo.current_user_role() IN ('admin','scientist','qc_lead','production_manager'));

-- =====================================================
-- 4.2.6 Policies: Users & Permissions (admin only)
-- =====================================================

CREATE POLICY "user_profiles_read_self_or_admin" ON demo.user_profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR demo.is_admin());
CREATE POLICY "user_profiles_admin_write" ON demo.user_profiles FOR ALL TO authenticated
  USING (demo.is_admin()) WITH CHECK (demo.is_admin());

CREATE POLICY "permissions_admin_only" ON demo.permissions FOR ALL TO authenticated
  USING (demo.is_admin()) WITH CHECK (demo.is_admin());

-- =====================================================
-- 4.2.7 Policies: Audit Log (admin read-only, no writes from app)
-- =====================================================

CREATE POLICY "audit_admin_read" ON demo.audit_log FOR SELECT TO authenticated
  USING (demo.is_admin());

-- =====================================================
-- 4.2.8 Policies: Forecasts (read-all, system-write)
-- =====================================================

CREATE POLICY "forecasts_read_all" ON demo.forecasts FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "forecasts_admin_write" ON demo.forecasts FOR ALL TO authenticated
  USING (demo.is_admin()) WITH CHECK (demo.is_admin());
