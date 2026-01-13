import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getSupabaseAdmin, isAdminClientConfigured } from '@/lib/supabase/admin';
import type { AuditLogInsert } from '@/lib/supabase/types';

/**
 * Whop Webhook Handler
 * 
 * Receives webhooks from Whop and logs them to audit_logs table.
 * This is Milestone 7.1: ingestion + audit logging only.
 * No Discord API calls or role revocation logic.
 */

// Postgres error code for unique constraint violation
const PG_UNIQUE_VIOLATION = '23505';

/**
 * Generate a deterministic hash from the webhook body as fallback webhook_id
 */
function generateFallbackWebhookId(body: string): string {
  return `fallback_${createHash('sha256').update(body).digest('hex').substring(0, 32)}`;
}

/**
 * Safely extract a string field from an object
 */
function extractString(obj: unknown, ...paths: string[]): string | null {
  for (const path of paths) {
    const keys = path.split('.');
    let value: unknown = obj;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        value = undefined;
        break;
      }
    }
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  // Check admin client configuration first
  const configCheck = isAdminClientConfigured();
  if (!configCheck.ok) {
    console.error('[Webhook] Admin client not configured:', configCheck.error);
    return NextResponse.json(
      { error: 'Server configuration error', details: configCheck.error },
      { status: 500 }
    );
  }

  // Parse request body
  let rawBody: string;
  let payload: unknown;

  try {
    rawBody = await request.text();
    payload = JSON.parse(rawBody);
  } catch (err) {
    console.error('[Webhook] Failed to parse JSON body:', err);
    // Still respond 200 to avoid Whop retries for malformed payloads
    return NextResponse.json({ received: true, error: 'Invalid JSON' }, { status: 200 });
  }

  // Extract webhook ID (Whop uses different field names in different event types)
  // Common patterns: id, message_id, event_id, data.id
  const webhookId =
    extractString(payload, 'id', 'message_id', 'event_id', 'data.id') ||
    generateFallbackWebhookId(rawBody);

  // Extract event type
  const eventType =
    extractString(payload, 'type', 'event', 'action', 'event_type') || 'unknown';

  // Extract company ID (biz_xxx format)
  const companyId =
    extractString(
      payload,
      'data.company_id',
      'company_id',
      'data.membership.company_id',
      'data.payment.company_id'
    ) || 'unknown';

  // Extract user ID
  const userId =
    extractString(
      payload,
      'data.user_id',
      'user_id',
      'data.membership.user_id',
      'data.user.id'
    ) || 'unknown';

  // Extract optional IDs
  const productId = extractString(
    payload,
    'data.product_id',
    'product_id',
    'data.membership.product_id'
  );
  const membershipId = extractString(
    payload,
    'data.membership_id',
    'membership_id',
    'data.membership.id',
    'data.id'
  );
  const paymentId = extractString(payload, 'data.payment_id', 'payment_id', 'data.payment.id');
  const disputeId = extractString(payload, 'data.dispute_id', 'dispute_id', 'data.dispute.id');
  const refundId = extractString(payload, 'data.refund_id', 'refund_id', 'data.refund.id');

  // Build audit log entry
  const auditEntry: AuditLogInsert = {
    webhook_id: webhookId,
    event_type: eventType,
    company_id: companyId,
    user_id: userId,
    product_id: productId,
    membership_id: membershipId,
    payment_id: paymentId,
    dispute_id: disputeId,
    refund_id: refundId,
    discord_user_id: null, // Not resolved yet (future milestone)
    action: 'webhook_received',
    result: 'success',
    error: null,
  };

  // Insert into audit_logs
  try {
    const supabase = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from('audit_logs').insert(auditEntry as any);

    if (error) {
      // Handle duplicate webhook_id (idempotency)
      if (error.code === PG_UNIQUE_VIOLATION) {
        console.log(`[Webhook] Duplicate webhook_id (idempotent): ${webhookId}`);
        return NextResponse.json({
          received: true,
          duplicate: true,
          webhook_id: webhookId,
        });
      }

      // Other database errors
      console.error('[Webhook] Database insert error:', error);
      return NextResponse.json({
        received: true,
        error: 'Database error',
        webhook_id: webhookId,
      });
    }

    console.log(`[Webhook] Logged: ${eventType} for company ${companyId} (${webhookId})`);
    return NextResponse.json({
      received: true,
      webhook_id: webhookId,
      event_type: eventType,
    });
  } catch (err) {
    console.error('[Webhook] Unexpected error:', err);
    return NextResponse.json({
      received: true,
      error: 'Internal error',
    });
  }
}

// Whop may send GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'whop-webhook' });
}
