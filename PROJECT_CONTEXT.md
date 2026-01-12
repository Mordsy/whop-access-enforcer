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
- Discord roles removed via bot
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
- Dashboard layout with Whop auth
- Dashboard config form (discord_guild_id, default_role_id)
- Server actions to load/save company_configs

## Current Milestone
Milestone 6.5 – Audit Log Viewer
- Read-only list of last 50 audit_logs per company
- Minimal table UI
- No filters, no charts

## Upcoming Milestones
- Webhook ingestion + logging (no Discord action yet)
- Discord REST role removal
- Discord identity resolver
