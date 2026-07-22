'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { useProfile } from '@/components/useProfile';
import GlassCard from '@/components/GlassCard';
import { supabase } from '@/lib/supabase';

export default function Admin() {
  const { profile } = useProfile();
  const [s, setS] = useState<any>(null);
  const [err, setErr] = useState('');
  const [debug, setDebug] = useState<any>(null);

  useEffect(() => {
    if (!profile) return;
    let active = true;

    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          if (active) setErr('Unauthorized');
          return;
        }
        const r = await fetch('/api/admin/stats', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const debugInfo = { status: r.status, ok: r.ok, statusText: r.statusText };
        
        let j: any = {};
        try {
          j = await r.json();
        } catch (parseErr: any) {
          j = { error: 'Failed to parse response: ' + parseErr.message };
        }
        
        if (active) setDebug({ ...debugInfo, response: j });
        if (!active) return;
        if (j.error) setErr(j.error);
        else {
          setErr('');
          setS(j.data);
        }
      } catch (e: any) {
        if (active) {
          setDebug({ error: e.message });
          setErr('Network error: ' + e.message);
        }
      }
    };

    load();
    const intervalId = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [profile]);

  if (!profile) return null;
  
  if (err) {
    return <AppShell title="Admin">
      <div className="glass p-10 rounded-lg">
        <div className="text-sm font-semibold text-red-600 mb-2">🔒 Error: {err}</div>
        <div className="text-xs text-stone">Ensure your account is in ADMIN_EMAILS or has admin role.</div>
      </div>
    </AppShell>;
  }

  const customers = (s?.customers || []) as any[];

  return (
    <AppShell title="Admin Panel" subtitle="Customer management and usage tracking.">
      {debug && (
        <GlassCard className="mb-6 bg-blue-50 dark:bg-blue-950 !border-blue-200 dark:!border-blue-800">
          <div className="text-xs font-mono">
            <div className="font-bold text-blue-700 dark:text-blue-300 mb-1">API Response:</div>
            <div>Status: {debug.status} {debug.statusText}</div>
            <div>Customers found: {customers.length}</div>
            {debug.response?.error && <div className="text-red-600 mt-1">Error: {debug.response.error}</div>}
          </div>
        </GlassCard>
      )}

      {!s && (
        <GlassCard className="text-center py-16">
          <div className="sk h-8 w-8 rounded inline-block" />
          <div className="text-sm text-stone mt-4">Loading customer data...</div>
        </GlassCard>
      )}

      {s && (
        <>
          {/* Customer Table */}
          <GlassCard className="!p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-bangladesh-green/15">
              <h3 className="font-semibold text-sm">Customers ({customers.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="text-left border-b border-bangladesh-green/15 bg-bangladesh-green/5">
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Plan</th>
                    <th className="px-4 py-2">Credits</th>
                    <th className="px-4 py-2">Requests</th>
                    <th className="px-4 py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-stone">No customers yet.</td>
                    </tr>
                  ) : (
                    customers.map((c: any) => (
                      <tr key={c.id} className="border-b border-bangladesh-green/10 hover:bg-bangladesh-green/5">
                        <td className="px-4 py-2 font-medium">{c.name || '-'}</td>
                        <td className="px-4 py-2 text-[11px] text-stone">{c.email}</td>
                        <td className="px-4 py-2 capitalize">{c.plan || 'trial'}</td>
                        <td className="px-4 py-2">{typeof c.credits === 'number' ? c.credits : '-'}</td>
                        <td className="px-4 py-2">{c.usage?.requests_total ?? 0}</td>
                        <td className="px-4 py-2 text-[11px] text-stone">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}
    </AppShell>
  );
}
