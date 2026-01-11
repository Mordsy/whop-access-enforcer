/**
 * Database types for Whop Access Enforcer
 * 
 * These types match the schema defined in supabase/migrations/001_initial_schema.sql
 */

// ============================================================================
// Table: company_configs
// ============================================================================

export interface CompanyConfig {
  id: string;
  company_id: string;           // Whop company ID (biz_xxx format)
  discord_guild_id: string | null;
  default_role_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyConfigInsert {
  company_id: string;
  discord_guild_id?: string | null;
  default_role_id?: string | null;
}

export interface CompanyConfigUpdate {
  discord_guild_id?: string | null;
  default_role_id?: string | null;
}

// ============================================================================
// Table: product_role_mappings
// ============================================================================

export interface ProductRoleMapping {
  id: string;
  company_id: string;
  whop_product_id: string;
  discord_role_id: string;
  created_at: string;
}

export interface ProductRoleMappingInsert {
  company_id: string;
  whop_product_id: string;
  discord_role_id: string;
}

export interface ProductRoleMappingUpdate {
  discord_role_id?: string;
}

// ============================================================================
// Table: audit_logs
// ============================================================================

export type AuditAction = 
  | 'revoke_role'
  | 'skip_no_discord_user'
  | 'skip_membership_active'
  | 'skip_dispute_status_ok';

export type AuditResult = 'success' | 'failed' | 'skipped';

export interface AuditLog {
  id: string;
  webhook_id: string;
  event_type: string;
  company_id: string;
  product_id: string | null;
  user_id: string;
  membership_id: string | null;
  payment_id: string | null;
  dispute_id: string | null;
  refund_id: string | null;
  discord_user_id: string | null;
  action: AuditAction;
  result: AuditResult;
  error: string | null;
  created_at: string;
}

export interface AuditLogInsert {
  webhook_id: string;
  event_type: string;
  company_id: string;
  product_id?: string | null;
  user_id: string;
  membership_id?: string | null;
  payment_id?: string | null;
  dispute_id?: string | null;
  refund_id?: string | null;
  discord_user_id?: string | null;
  action: AuditAction;
  result: AuditResult;
  error?: string | null;
}

// ============================================================================
// Database schema type (for Supabase client typing)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      company_configs: {
        Row: CompanyConfig;
        Insert: CompanyConfigInsert;
        Update: CompanyConfigUpdate;
      };
      product_role_mappings: {
        Row: ProductRoleMapping;
        Insert: ProductRoleMappingInsert;
        Update: ProductRoleMappingUpdate;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: AuditLogInsert;
        Update: never; // Audit logs should not be updated
      };
    };
  };
}
