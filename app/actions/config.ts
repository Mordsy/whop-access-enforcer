'use server';

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { CompanyConfig, CompanyConfigInsert } from '@/lib/supabase/types';

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get company config by company_id
 */
export async function getCompanyConfig(
  companyId: string
): Promise<ActionResult<CompanyConfig | null>> {
  const configCheck = isSupabaseConfigured();
  if (!configCheck.ok) {
    return { success: false, error: configCheck.error };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('company_configs')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error) {
      // PGRST116 = no rows returned, which is fine for new companies
      if (error.code === 'PGRST116') {
        return { success: true, data: null };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Upsert company config (insert or update based on company_id)
 */
export async function saveCompanyConfig(
  companyId: string,
  config: {
    discord_guild_id?: string | null;
    default_role_id?: string | null;
  }
): Promise<ActionResult<CompanyConfig>> {
  const configCheck = isSupabaseConfigured();
  if (!configCheck.ok) {
    return { success: false, error: configCheck.error };
  }

  try {
    const supabase = getSupabase();
    
    // Check if config exists
    const { data: existing } = await supabase
      .from('company_configs')
      .select('id')
      .eq('company_id', companyId)
      .single();

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('company_configs')
        .update({
          discord_guild_id: config.discord_guild_id ?? null,
          default_role_id: config.default_role_id ?? null,
        })
        .eq('company_id', companyId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } else {
      // Insert new
      const insertData: CompanyConfigInsert = {
        company_id: companyId,
        discord_guild_id: config.discord_guild_id ?? null,
        default_role_id: config.default_role_id ?? null,
      };

      const { data, error } = await supabase
        .from('company_configs')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    }
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error occurred' 
    };
  }
}
