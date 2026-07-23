'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useProfile } from '@/components/useProfile';
import { supabase } from '@/lib/supabase';
import { Icon } from '@/components/Icon';

export default function CreativeStudio() {
  const { profile } = useProfile();
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

        const spend = await fetch('/api/credits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action: 'design', label: 'Creative Studio design saved' }),
        });
        if (cancelled) return;
        if (!spend.ok) {
          const err = await spend.json().catch(() => ({}));
          post({ type: 'designSaveFailed', reqId, reason: err.error || 'spend_failed', balance: err.balance });
          return;
        }
        const spendResult = await spend.json();
        window.dispatchEvent(new Event('credits:changed'));

        const row = {
          user_id: profile.id,
          brand_id: design.brandId || null,
          name: design.name || 'Untitled design',
          width: design.width,
          height: design.height,
          data: design.data,
          updated_at: new Date().toISOString(),
        };
        const result = design.id
          ? await supabase.from('designs').update(row).eq('id', design.id).select('id').single()
          : await supabase.from('designs').insert(row).select('id').single();
        if (cancelled) return;
        if (result.data) post({ type: 'designSaved', reqId, id: result.data.id, balance: spendResult.balance });
        else post({ type: 'designSaveFailed', reqId, reason: 'save_failed' });
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

  if (!profile) {
    return (
      <div className="min-h-screen section-light grid place-items-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-caribbean-green border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0">
      <Link
        href="/dashboard"
        className="fixed top-3 left-3 z-[10000] inline-flex items-center gap-1.5 rounded-full bg-rich-black text-anti-flash-white text-xs font-medium px-3.5 py-2 shadow-lg hover:brightness-110 transition"
      >
        <Icon name="arrow_back" className="text-sm" /> Zelvoo
      </Link>
      <iframe
        ref={frameRef}
        src="/creative-studio.html"
        title="Zelvoo Creative Studio"
        className="w-full h-full border-0"
      />
    </div>
  );
}
