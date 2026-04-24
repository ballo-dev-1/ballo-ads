CREATE TABLE IF NOT EXISTS crm_clients (
  id UUID PRIMARY KEY,
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'Lusaka, Zambia',
  balloads_account_id TEXT NOT NULL UNIQUE,
  plan_tier TEXT NOT NULL,
  account_status TEXT NOT NULL DEFAULT 'active',
  health_score INTEGER NOT NULL DEFAULT 100,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  signed_up_at TIMESTAMPTZ NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_segments (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'dynamic',
  rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  client_count INTEGER NOT NULL DEFAULT 0,
  last_evaluated_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_journeys (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  trigger_type TEXT NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  flow_definition JSONB NOT NULL DEFAULT '{"nodes":[],"edges":[]}'::jsonb,
  entry_segment_id UUID,
  max_duration_days INTEGER NOT NULL DEFAULT 7,
  entry_mode TEXT NOT NULL DEFAULT 'once_per_client',
  created_by TEXT NOT NULL,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_campaigns (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  journey_id UUID,
  segment_id UUID,
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  user_limit INTEGER NOT NULL DEFAULT 100000,
  exec_speed INTEGER NOT NULL DEFAULT 500,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_audit_logs (
  id UUID PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
