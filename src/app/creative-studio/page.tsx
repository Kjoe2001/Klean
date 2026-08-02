'use client';
import { useEffect, useRef } from 'react';
import { useProfile } from '@/components/useProfile';
import { supabase } from '@/lib/supabase';
import AppShell from '@/components/AppShell';

function CreativeStudioContent() {
  const { profile, loading } = useProfile();
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;

    const post = (msg: Record<string, any>) => {
      frameRef.current?.contentWindow?.postMessage({ ns: 'zelvoo', ...msg }, window.location.origin);
    };

    const sendInit = async () => {
      const [{ data: brands }, { data: designs }] = await Promise.all([
        supabase.from('brands').select('*').eq('user_id', profile.id).order('created_at', { ascending: true }),
        supabase.from('designs').select('*').eq('user_id', profile.id).order('updated_at', { ascending: false }),
      ]);
      if (cancelled) return;
      post({ type: 'init', kits: brands || [], designs: designs || [] });
    };

    const onMessage = async (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data;
      if (!d || d.ns !== 'zelvoo') return;

      if (d.type === 'ready') {
        sendInit();
        return;
      }

      if (d.type === 'saveDesign') {
        const { design, reqId } = d;
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (cancelled) return;
        if (!token) { post({ type: 'designSaveFailed', reqId, reason: 'unauthorized' }); return; }

        const save = await fetch('/api/creative-studio/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ design }),
        });
        if (cancelled) return;
        if (!save.ok) {
          const err = await save.json().catch(() => ({}));
          post({ type: 'designSaveFailed', reqId, reason: err.error || 'save_failed', balance: err.balance });
          return;
        }
        const saveResult = await save.json();
        window.dispatchEvent(new Event('credits:changed'));
        post({ type: 'designSaved', reqId, id: saveResult.id, balance: saveResult.balance });
        return;
      }

      if (d.type === 'deleteDesign') {
        await supabase.from('designs').delete().eq('id', d.id);
        return;
      }

      if (d.type === 'saveBrand') {
        const { brand, reqId } = d;
        const row = {
          user_id: profile.id,
          name: brand.name || 'Untitled brand',
          colors: brand.colors,
          fonts: brand.fonts,
          logo_url: brand.logo_url,
          taglines: brand.taglines,
        };
        const result = brand.id
          ? await supabase.from('brands').update(row).eq('id', brand.id).select('id').single()
          : await supabase.from('brands').insert(row).select('id').single();
        if (!cancelled && result.data) post({ type: 'brandSaved', reqId, id: result.data.id });
        return;
      }
    };

    window.addEventListener('message', onMessage);
    return () => { cancelled = true; window.removeEventListener('message', onMessage); };
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen section-light grid place-items-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-caribbean-green border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const shellContent = (
    <div className="min-h-[calc(100vh-8rem)]">
      <iframe
        ref={frameRef}
        src="/creative-studio.html"
        title="Zelvoo Creative Studio"
        className="w-full h-[calc(100vh-8rem)] rounded-[20px] border-0"
      />
    </div>
  );

  return (
    <AppShell title="Creative Studio" subtitle="Create and export your visual assets from your account">
      {shellContent}
    </AppShell>
  );
}

export default function CreativeStudioPage() {
  return <CreativeStudioContent />;
}
