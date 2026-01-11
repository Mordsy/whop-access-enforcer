-- Whop Access Enforcer - Initial Schema
-- Creates tables for company configs, product role mappings, and audit logs

-- ============================================================================
-- Table: company_configs
-- Stores Discord server configuration per Whop company
-- ============================================================================
CREATE TABLE company_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL UNIQUE,  -- Whop company ID (biz_xxx format)
    discord_guild_id TEXT,            -- Selected Discord server ID
    default_role_id TEXT,             -- Optional default role to revoke
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by company_id
CREATE INDEX idx_company_configs_company_id ON company_configs(company_id);

-- ============================================================================
-- Table: product_role_mappings
-- Maps Whop products to Discord roles for a company
-- ============================================================================
CREATE TABLE product_role_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL REFERENCES company_configs(company_id) ON DELETE CASCADE,
    whop_product_id TEXT NOT NULL,    -- Whop product ID
    discord_role_id TEXT NOT NULL,    -- Discord role to revoke
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Each product can only have one role mapping per company
    UNIQUE(company_id, whop_product_id)
);

-- Index for fast lookups by company_id
CREATE INDEX idx_product_role_mappings_company_id ON product_role_mappings(company_id);

-- ============================================================================
-- Table: audit_logs
-- Tracks all webhook events and actions taken for auditing
-- ============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id TEXT NOT NULL UNIQUE,  -- Whop webhook message ID (idempotency key)
    event_type TEXT NOT NULL,         -- e.g., membership.deactivated
    company_id TEXT NOT NULL,         -- Whop company ID
    product_id TEXT,                  -- Whop product ID (nullable)
    user_id TEXT NOT NULL,            -- Whop user ID
    membership_id TEXT,               -- Whop membership ID (nullable)
    payment_id TEXT,                  -- Whop payment ID (nullable)
    dispute_id TEXT,                  -- Whop dispute ID (nullable)
    refund_id TEXT,                   -- Whop refund ID (nullable)
    discord_user_id TEXT,             -- Resolved Discord user ID (nullable)
    action TEXT NOT NULL,             -- e.g., "revoke_role", "skip_no_discord_user"
    result TEXT NOT NULL,             -- "success", "failed", "skipped"
    error TEXT,                       -- Error message (nullable)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);

-- ============================================================================
-- Trigger: Auto-update updated_at on company_configs
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_configs_updated_at
    BEFORE UPDATE ON company_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
