Project: Whop Access Enforcer

Current state (authoritative):
- Stack: Next.js App Router, Supabase, Whop SDK, Discord REST (future)
- Dashboard app embedded in Whop
- Supabase schema applied (company_configs, product_role_mappings, audit_logs)
- Milestone 6.5 DONE: Audit Log Viewer (read-only, last 50, no filters)
- Milestone 7.1 DONE:
  - app/api/whop/webhook/route.ts exists
  - Uses service-role Supabase client (server-only)
  - Ingests Whop webhooks
  - Idempotent via audit_logs.webhook_id (UNIQUE)
  - Logs webhook_received / success
  - Verified via local POST + SQL + dashboard
- Dev-only Whop auth bypass exists (env-gated, local only)
- All changes committed & pushed

Next milestone:
- Milestone 7.2: Whop webhook signature verification ONLY
  (No Discord logic yet, no UI changes)

Goal:
- Continue in small, disciplined steps.
- Avoid Cursor overreach.
- One milestone sub-step at a time.

Proceed to Milestone 7.2.
