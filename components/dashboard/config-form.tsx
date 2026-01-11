'use client';

import { useState, useTransition } from 'react';
import { saveCompanyConfig } from '@/app/actions/config';
import type { CompanyConfig } from '@/lib/supabase/types';

interface ConfigFormProps {
  companyId: string;
  initialConfig: CompanyConfig | null;
}

export function ConfigForm({ companyId, initialConfig }: ConfigFormProps) {
  const [isPending, startTransition] = useTransition();
  const [discordGuildId, setDiscordGuildId] = useState(
    initialConfig?.discord_guild_id ?? ''
  );
  const [defaultRoleId, setDefaultRoleId] = useState(
    initialConfig?.default_role_id ?? ''
  );
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await saveCompanyConfig(companyId, {
        discord_guild_id: discordGuildId || null,
        default_role_id: defaultRoleId || null,
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Configuration saved successfully!' });
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save configuration' });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            <p className="text-sm text-zinc-500">Enter the Discord server (guild) ID to manage</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="discord_guild_id" className="block text-sm font-medium text-zinc-400">
            Discord Server ID
          </label>
          <input
            type="text"
            id="discord_guild_id"
            value={discordGuildId}
            onChange={(e) => setDiscordGuildId(e.target.value)}
            placeholder="e.g., 123456789012345678"
            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-zinc-500">
            Right-click your server → Copy Server ID (Developer Mode must be enabled)
          </p>
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
        
        <div className="space-y-2">
          <label htmlFor="default_role_id" className="block text-sm font-medium text-zinc-400">
            Default Role ID (optional)
          </label>
          <input
            type="text"
            id="default_role_id"
            value={defaultRoleId}
            onChange={(e) => setDefaultRoleId(e.target.value)}
            placeholder="e.g., 123456789012345678"
            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-zinc-500">
            Right-click the role in Server Settings → Copy Role ID
          </p>
        </div>
      </section>

      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-zinc-600 disabled:to-zinc-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg shadow-violet-500/25"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </span>
          ) : (
            'Save Configuration'
          )}
        </button>
      </div>
    </form>
  );
}
