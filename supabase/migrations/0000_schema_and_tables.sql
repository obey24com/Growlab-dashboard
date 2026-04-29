-- =====================================================
-- 4.1.1 Schema Setup
-- =====================================================

CREATE SCHEMA IF NOT EXISTS demo;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 4.1.2 Reference Tables (rarely changed)
-- =====================================================

CREATE TABLE demo.varieties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  scientific_name TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE demo.stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  stage_group TEXT NOT NULL,
  sequence_order INT NOT NULL,
  expected_duration_days INT NOT NULL,
  expected_yield_low NUMERIC(5,2),
  expected_yield_high NUMERIC(5,2),
  jar_type TEXT,
  jar_ratio INT DEFAULT 1,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, code)
);

CREATE TABLE demo.observation_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('qc_check','count','anomaly','note','measurement')),
  schema JSONB NOT NULL,
  is_required BOOLEAN DEFAULT FALSE,
  applies_to_stages TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, code)
);

-- =====================================================
-- 4.1.3 Core Operational Tables
-- =====================================================

CREATE TABLE demo.batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  batch_code TEXT NOT NULL,
  variety_id UUID NOT NULL REFERENCES demo.varieties(id),
  current_stage_id UUID REFERENCES demo.stages(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','completed','failed','archived')),
  initial_jar_count INT NOT NULL,
  current_jar_count INT,
  mother_tree_lineage TEXT,
  origin_facility TEXT DEFAULT 'HCMC-Lab-1',
  started_at TIMESTAMPTZ NOT NULL,
  expected_completion_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, batch_code)
);

CREATE INDEX idx_batches_status ON demo.batches(status);
CREATE INDEX idx_batches_variety ON demo.batches(variety_id);
CREATE INDEX idx_batches_current_stage ON demo.batches(current_stage_id);

CREATE TABLE demo.stage_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  batch_id UUID NOT NULL REFERENCES demo.batches(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES demo.stages(id),
  entry_mode TEXT NOT NULL DEFAULT 'aggregate' CHECK (entry_mode IN ('aggregate','per_jar')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','failed')),
  jar_count INT NOT NULL,
  survival_count INT,
  yield_ratio NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN jar_count > 0 THEN survival_count::NUMERIC / jar_count ELSE NULL END
  ) STORED,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  operator_id UUID NOT NULL,
  qc_lead_id UUID,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stage_entries_batch ON demo.stage_entries(batch_id);
CREATE INDEX idx_stage_entries_stage ON demo.stage_entries(stage_id);
CREATE INDEX idx_stage_entries_operator ON demo.stage_entries(operator_id);
CREATE INDEX idx_stage_entries_status ON demo.stage_entries(status);

CREATE TABLE demo.jar_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  stage_entry_id UUID NOT NULL REFERENCES demo.stage_entries(id) ON DELETE CASCADE,
  jar_label TEXT NOT NULL,
  jar_position INT,
  is_alive BOOLEAN,
  observation_data JSONB DEFAULT '{}',
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stage_entry_id, jar_label)
);

CREATE INDEX idx_jar_entries_stage_entry ON demo.jar_entries(stage_entry_id);

CREATE TABLE demo.observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  stage_entry_id UUID NOT NULL REFERENCES demo.stage_entries(id) ON DELETE CASCADE,
  jar_entry_id UUID REFERENCES demo.jar_entries(id) ON DELETE CASCADE,
  observation_type_id UUID REFERENCES demo.observation_types(id),
  category TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  severity TEXT CHECK (severity IN ('info','warning','critical')),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_observations_stage_entry ON demo.observations(stage_entry_id);
CREATE INDEX idx_observations_category ON demo.observations(category);
CREATE INDEX idx_observations_severity ON demo.observations(severity);

CREATE TABLE demo.media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  observation_id UUID REFERENCES demo.observations(id) ON DELETE CASCADE,
  stage_entry_id UUID REFERENCES demo.stage_entries(id) ON DELETE CASCADE,
  jar_entry_id UUID REFERENCES demo.jar_entries(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo','document','video')),
  storage_path_original TEXT NOT NULL,
  storage_path_thumbnail TEXT,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT,
  width INT,
  height INT,
  exif JSONB DEFAULT '{}',
  ai_tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_observation ON demo.media(observation_id);
CREATE INDEX idx_media_stage_entry ON demo.media(stage_entry_id);

-- =====================================================
-- 4.1.4 User & Permissions Tables
-- =====================================================

CREATE TABLE demo.user_profiles (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin','scientist','qc_lead','production_manager','viewer')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en','vi')),
  is_active BOOLEAN DEFAULT TRUE,
  is_demo BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE demo.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES demo.user_profiles(id) ON DELETE CASCADE,
  resource TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('read','write','delete','approve','admin')),
  granted_by UUID,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource, action)
);

-- =====================================================
-- 4.1.5 Audit Log (immutable, day 1)
-- =====================================================

CREATE TABLE demo.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  actor_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before_state JSONB,
  after_state JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_actor ON demo.audit_log(actor_id);
CREATE INDEX idx_audit_entity ON demo.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON demo.audit_log(created_at DESC);

REVOKE UPDATE, DELETE ON demo.audit_log FROM PUBLIC;

-- =====================================================
-- 4.1.6 Forecast Cache (stub agent output)
-- =====================================================

CREATE TABLE demo.forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL,
  horizon TEXT NOT NULL CHECK (horizon IN ('90_day','12_month','36_month')),
  variety_id UUID REFERENCES demo.varieties(id),
  forecast_data JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by TEXT DEFAULT 'forecasting_agent_v1',
  confidence_score NUMERIC(3,2)
);

-- =====================================================
-- 4.1.7 Updated-at Triggers
-- =====================================================

CREATE OR REPLACE FUNCTION demo.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_varieties_updated BEFORE UPDATE ON demo.varieties
  FOR EACH ROW EXECUTE FUNCTION demo.update_updated_at();
CREATE TRIGGER trg_batches_updated BEFORE UPDATE ON demo.batches
  FOR EACH ROW EXECUTE FUNCTION demo.update_updated_at();
CREATE TRIGGER trg_stage_entries_updated BEFORE UPDATE ON demo.stage_entries
  FOR EACH ROW EXECUTE FUNCTION demo.update_updated_at();
CREATE TRIGGER trg_user_profiles_updated BEFORE UPDATE ON demo.user_profiles
  FOR EACH ROW EXECUTE FUNCTION demo.update_updated_at();

-- =====================================================
-- 4.1.8 Audit Triggers (auto-write on every change)
-- =====================================================

CREATE OR REPLACE FUNCTION demo.audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO demo.audit_log (
    org_id, actor_id, actor_email, action, entity_type, entity_id,
    before_state, after_state
  ) VALUES (
    COALESCE(NEW.org_id, OLD.org_id),
    auth.uid(),
    auth.email(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_batches_audit AFTER INSERT OR UPDATE OR DELETE ON demo.batches
  FOR EACH ROW EXECUTE FUNCTION demo.audit_trigger();
CREATE TRIGGER trg_stage_entries_audit AFTER INSERT OR UPDATE OR DELETE ON demo.stage_entries
  FOR EACH ROW EXECUTE FUNCTION demo.audit_trigger();
CREATE TRIGGER trg_observations_audit AFTER INSERT OR UPDATE OR DELETE ON demo.observations
  FOR EACH ROW EXECUTE FUNCTION demo.audit_trigger();
CREATE TRIGGER trg_user_profiles_audit AFTER INSERT OR UPDATE OR DELETE ON demo.user_profiles
  FOR EACH ROW EXECUTE FUNCTION demo.audit_trigger();
