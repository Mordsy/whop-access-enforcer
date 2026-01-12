"use server";

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export type AuditLog = {
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
  action: string;
  result: string;
  error: string | null;
  created_at: string;
};

export async function getAuditLogs(companyId: string, limit = 50) {
  if (!isSupabaseConfigured()) {
    return {
      ok: false as const,
      data: [] as AuditLog[],
      error: "Supabase is not configured",
    };
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { ok: false as const, data: [], error };
  }

  return { ok: true as const, data: data ?? [], error: null };
}
