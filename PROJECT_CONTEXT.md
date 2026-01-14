# Whop Access Enforcer – Project Context

## Purpose
A B2B dashboard app for Whop sellers that automatically revokes Discord access
when a membership becomes invalid (cancellation, refund, dispute).

## Target User
Whop sellers (admins), not end customers.

## Stack
- Next.js (App Router)
- Supabase (Postgres)
- Whop SDK
- Discord REST API (no gateway / no discord.js)
- Deployed on Vercel

## Architecture Summary
- Dashboard app installed by sellers
- Seller config saved per Whop company (biz_...)
- Webhooks from Whop trigger revocation logic
- Discord roles removed via bot token (REST)
- All actions logged to audit_logs for transparency

## Database Tables
- company_configs
- product_role_mappings
- audit_logs

## Conventions
- Database: snake_case
- TypeScript: camelCase
- Secrets via env vars only
- Idempotent webhook handling
- One Discord server per company (v1)

## Milestones Completed
- Supabase schema migration
- Supabase client with env-var safety
- Dashboard layout with Whop auth (dev bypass available for local)
- Dashboard config form (discord_guild_id, default_role_id)
- Server actions to load/save company_configs
- Milestone 6.5: Audit Log Viewer (read-only last 50)
- Milestone 7.1: Webhook ingestion + logging (idempotent)

## Current Milestone
Milestone 7.2 – Webhook signature verification (no Discord actions)

## Upcoming Milestones
- Milestone 8: Discord REST role removal
- Milestone 9: Discord identity resolver
- Hardening & polish (retries, rate limits, onboarding)



## Roadmap

Project: Whop Access Enforcer

Authoritative state (current):

Completed:
- Supabase schema applied:
  - company_configs
  - product_role_mappings
  - audit_logs
- Milestone 6.5 DONE:
  - Audit Log Viewer (read-only, last 50, no filters)
- Milestone 7.1 DONE:
  - Webhook endpoint: app/api/whop/webhook/route.ts
  - Uses server-only Supabase service role client
  - Ingests Whop webhooks
  - Logs to audit_logs with action=webhook_received
  - Idempotent via audit_logs.webhook_id (UNIQUE)
  - Verified locally via POST + SQL + dashboard
- Dev-only Whop auth bypass exists (env-gated, local only)
- All changes committed and pushed

Roadmap (IMPORTANT — not finished yet):

Phase I: Trust & Observability
- Milestone 7.2 (NEXT): Webhook signature verification ONLY
  - Verify Whop webhook authenticity
  - Reject invalid signatures
  - No Discord logic
  - No UI changes
  - No business actions

Phase II: Core Business Logic (the actual product)
- Milestone 8: Discord role revocation
  - Resolve Discord user identity
  - Map Whop product → Discord role
  - Remove role via Discord REST API
  - Log success/failure to audit_logs
  - Handle edge cases (user not found, role missing, etc.)

Phase III: Hardening & Polish
- Retry logic
- Failure recovery
- Better admin UX
- Production config validation
- Onboarding flow

Operating rules:
- Proceed in small, testable milestones
- Avoid overreach
- One responsibility per step
- No “helpful” extras unless requested

Task:
Proceed to Milestone 7.2 (Whop webhook signature verification only).

## Cursor Prompting Rules (IMPORTANT)

When using Cursor (as the building of this project currently is) follow these rules strictly:

### Scope & Pace
- Work in **small, discrete milestones** only.
- Implement **one responsibility per step**.
- Do not jump ahead to future milestones unless explicitly instructed.
- Prefer correctness and clarity over speed or cleverness.

### What NOT to do unless explicitly requested
- Do NOT add Discord logic before Milestone 8.
- Do NOT modify UI components when working on backend milestones.
- Do NOT refactor unrelated files.
- Do NOT introduce abstractions “for future use”.
- Do NOT add features, validations, retries, or optimizations beyond the stated task.
- Do NOT assume missing requirements — ask or stop.

### Implementation Discipline
- Follow existing project conventions (snake_case DB, camelCase TS).
- Reuse existing patterns (ActionResult, Supabase helpers, audit logging).
- Keep new files minimal and focused.
- Prefer explicit code over “magic” or meta-framework patterns.

### Verification
- Every milestone must be:
  - testable locally
  - verifiable via SQL or logs
  - visible in the audit log when applicable
- If a step cannot be verified, it is not complete.

### Mindset
- This project prioritizes **predictability and safety** over rapid expansion.
- Security gates (e.g., webhook verification) come *before* business actions.
- Cursor should behave like a careful senior engineer, not an auto-scaffolder.

If a task seems ambiguous:
- Stop.
- Ask for clarification.
- Do not guess.

