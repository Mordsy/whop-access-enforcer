import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { ConfigForm } from '@/components/dashboard/config-form';
import { getAuditLogs } from '@/app/actions/audit-logs';

interface DashboardPageProps {
  params: Promise<{ companyId: string }>;
}

async function getCompanyConfig(companyId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('company_configs')
    .select('*')
    .eq('company_id', companyId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching company config:', error);
  }

  return data;
}

async function getProductRoleMappings(companyId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('product_role_mappings')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching role mappings:', error);
    return [];
  }

  return data || [];
}

/**
 * Helper to truncate long error messages
 */
function truncateError(error: string | null, maxLength: number = 50): string {
  if (!error) return '—';
  if (error.length <= maxLength) return error;
  return error.substring(0, maxLength) + '…';
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { companyId } = await params;

  // Check Supabase configuration
  const supabaseCheck = isSupabaseConfigured();
  if (!supabaseCheck.ok) {
    return (
      <div className="space-y-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-red-400">Configuration Error</h2>
          </div>
          <p className="text-red-300">{supabaseCheck.error}</p>
          <p className="text-sm text-red-400/70 mt-2">
            Please ensure all required environment variables are set in your deployment.
          </p>
        </div>
      </div>
    );
  }

  const [config, roleMappings, auditLogsResult] = await Promise.all([
    getCompanyConfig(companyId),
    getProductRoleMappings(companyId),
    getAuditLogs(companyId, 50),
  ]);

  const auditLogs = auditLogsResult.success ? auditLogsResult.data ?? [] : [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Discord Access Enforcer
        </h2>
        <p className="text-zinc-400">
          Automatically revoke Discord roles when memberships are deactivated, refunded, or disputed.
        </p>
      </div>

      {/* Configuration Form (Discord Guild + Default Role) */}
      <ConfigForm companyId={companyId} initialConfig={config} />

      {/* Product Role Mappings */}
      <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Product Role Mappings</h3>
              <p className="text-sm text-zinc-500">Map Whop products to Discord roles</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors">
            Add Mapping
          </button>
        </div>
        
        <div className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 overflow-hidden">
          {roleMappings.length > 0 ? (
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Product ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Discord Role ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700/50">
                {roleMappings.map((mapping) => (
                  <tr key={mapping.id}>
                    <td className="px-4 py-3 text-sm font-mono text-zinc-300">
                      {mapping.whop_product_id}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-zinc-300">
                      {mapping.discord_role_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500">
                      {new Date(mapping.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-red-400 hover:text-red-300 text-sm">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-400">No product role mappings configured</p>
              <p className="text-sm text-zinc-500 mt-1">
                Add mappings to automatically revoke specific roles when products are cancelled
              </p>
            </div>
          )}
        </div>
      </section>

{/* 
  Milestone 6.5 MVP: Audit Log Viewer
  Read-only last 50 logs for the company. No filters, no pagination, no charts.
*/}


      {/* Audit Logs */}
      <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Audit Log</h3>
            <p className="text-sm text-zinc-500">Recent role revocation events (last 50)</p>
          </div>
        </div>
        
        <div className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 overflow-hidden">
          {auditLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      Event Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      Result
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      Error
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      User ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      Membership ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700/50">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-800/30">
                      <td className="px-4 py-3 text-sm text-zinc-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300 whitespace-nowrap">
                        {log.event_type}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300 whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          log.result === 'success' 
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : log.result === 'skipped'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {log.result}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500 max-w-[200px]" title={log.error || undefined}>
                        {truncateError(log.error)}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-zinc-400 whitespace-nowrap">
                        {log.user_id}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-zinc-400 whitespace-nowrap">
                        {log.membership_id || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-zinc-400 font-medium">No activity recorded yet</p>
              <p className="text-sm text-zinc-500 mt-1">
                Events will appear here once webhooks start processing
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
