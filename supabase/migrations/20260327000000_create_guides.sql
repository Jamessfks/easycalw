-- EasyClaw Guides Table Schema
-- Run against Supabase SQL Editor or via REST API

CREATE TABLE IF NOT EXISTS guides (
    id BIGSERIAL PRIMARY KEY,
    guide_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'generating',
    message TEXT,
    formatted_transcript TEXT,
    setup_guide TEXT,
    reference_documents JSONB DEFAULT '[]',
    prompts_to_send TEXT,
    scorecard JSONB,
    quality_eval JSONB,
    model TEXT,
    agent_cost_usd NUMERIC(8, 4),
    agent_turns INTEGER,
    agent_duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guides_guide_id ON guides(guide_id);
CREATE INDEX IF NOT EXISTS idx_guides_created_at ON guides(created_at);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON guides;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON guides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
