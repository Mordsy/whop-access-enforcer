import { supabase } from '@/lib/supabase/client';

interface DashboardPageProps {
  params: Promise<{ companyId: string }>;
}

async function getCompanyConfig(companyId: string) {
  const { data, error } = await supabase
    .from('company_configs')
    .select('*')
    .eq('company_id', companyId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned, which is fine for new companies
    console.error('Error fetching company config:', error);
  }

  return data;
}

async function getProductRoleMappings(companyId: string) {
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

async function getRecentAuditLogs(companyId: string) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }

  return data || [];
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { companyId } = await params;
  
  const [config, roleMappings, auditLogs] = await Promise.all([
    getCompanyConfig(companyId),
    getProductRoleMappings(companyId),
    getRecentAuditLogs(companyId),
  ]);

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

      {/* Discord Guild Configuration */}
      <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Discord Server</h3>
            <p className="text-sm text-zinc-500">Select the Discord server to manage</p>
          </div>
        </div>
        
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
          {config?.discord_guild_id ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Connected Server ID</p>
                <p className="text-white font-mono">{config.discord_guild_id}</p>
              </div>
              <button className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm transition-colors">
                Change
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-zinc-400 mb-3">No Discord server connected</p>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                Connect Discord Server
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Default Role Configuration */}
      <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Default Role</h3>
            <p className="text-sm text-zinc-500">Fallback role to revoke if no product mapping exists</p>
          </div>
        </div>
        
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
          {config?.default_role_id ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Default Role ID</p>
                <p className="text-white font-mono">{config.default_role_id}</p>
              </div>
              <button className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm transition-colors">
                Change
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-zinc-400 mb-3">No default role configured</p>
              <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors">
                Set Default Role
              </button>
            </div>
          )}
        </div>
      </section>

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

      {/* Recent Audit Logs */}
      <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <p className="text-sm text-zinc-500">Audit log of role revocation actions</p>
          </div>
        </div>
        
        <div className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 overflow-hidden">
          {auditLogs.length > 0 ? (
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700/50">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {log.event_type}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-zinc-400">
                      {log.user_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {log.action}
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-sm text-zinc-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-400">No activity recorded yet</p>
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
