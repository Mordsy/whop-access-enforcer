"use server";

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { AuditLog } from "@/lib/supabase/types";
import type { ActionResult } from "@/lib/types"; // If this path differs in your repo, see note below.

export async function getAuditLogs(
  companyId: string,
  limit: number = 50
): Promise<ActionResult<AuditLog[]>> {
  const configCheck = isSupabaseConfigured();
  if (!configCheck.ok) {
    return { success: false, error: configCheck.error };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}