'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import AppShell from '@/components/AppShell';
import PageHead from '@/components/PageHead';
import { supabase } from '@/lib/supabase';

const FOLDERS = ['All assets', 'Logos', 'Product', 'Creatives', 'Docs', 'Other'];
const MAX_ASSETS = 120;

type StoredAsset = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  folder: string;
  created_at: string;
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function inferFolder(fileName: string, mimeType: string) {
  const name = fileName.toLowerCase();
  if (name.includes('logo')) return 'Logos';
  if (mimeType.startsWith('image/')) {
    if (name.includes('product')) return 'Product';
    return 'Creatives';
  }
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'Docs';
  return 'Other';
}

function humanSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function getAccessToken() {
  let { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) return session.access_token;

  await supabase.auth.getUser();
  ({ data: { session } } = await supabase.auth.getSession());
  if (session?.access_token) return session.access_token;

  const refreshed = await supabase.auth.refreshSession();
  return refreshed.data.session?.access_token || null;
}

export default function Assets() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [folder, setFolder] = useState('All assets');
  const [assets, setAssets] = useState<StoredAsset[]>([]);
  const [activation, setActivation] = useState<any>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const list = useMemo(
    () => assets.filter((a) => folder === 'All assets' || a.folder === folder),
    [assets, folder],
  );

  const getUser = async () => {
    const { data: auth } = await supabase.auth.getUser();
    return auth.user || null;
  };

  const loadAssets = async () => {
    setBusy(true);
    setErr('');
    try {
      const user = await getUser();
      if (!user) {
        setAssets([]);
        return;
      }

      const { data: profile, error } = await supabase.from('profiles').select('activation').eq('id', user.id).single();
      if (!error) {
        const nextActivation = (profile?.activation && typeof profile.activation === 'object') ? profile.activation : {};
        const rows = Array.isArray((nextActivation as any).uploaded_assets) ? (nextActivation as any).uploaded_assets : [];
        setActivation(nextActivation);
        setAssets(rows.slice(0, MAX_ASSETS));
        return;
      }
      setActivation({});
      setAssets([]);
    } catch (e: any) {
      setErr(e?.message || 'Could not load assets.');
    } finally {
      setBusy(false);
    }
  };

  const writeAssets = async (nextAssets: StoredAsset[]) => {
    const user = await getUser();
    if (!user) throw new Error('Please log in again.');

    const nextActivation = { ...activation, uploaded_assets: nextAssets.slice(0, MAX_ASSETS) };
    const { error } = await supabase.from('profiles').update({ activation: nextActivation }).eq('id', user.id);
    if (error) throw new Error(error.message);
    setActivation(nextActivation);
  };

  const onUploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setErr('');
    try {
      const user = await getUser();
      if (!user) throw new Error('Please log in again.');

      const existing = [...assets];
      const uploaded: StoredAsset[] = [];

      for (const file of Array.from(files)) {
        const token = await getAccessToken();
        if (!token) throw new Error('Please log in again to upload files.');

        const form = new FormData();
        form.append('file', file);
        const uploadRes = await fetch('/api/assets/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(`Upload failed for ${file.name}: ${uploadData?.error || 'unknown error'}`);
        }

        uploaded.push({
          id: makeId(),
          name: uploadData.name || file.name,
          url: uploadData.url,
          type: uploadData.type || file.type || 'application/octet-stream',
          size: Number(uploadData.size || file.size || 0),
          folder: inferFolder(file.name, file.type || ''),
          created_at: new Date().toISOString(),
        });
      }

      const next = [...uploaded, ...existing].slice(0, MAX_ASSETS);
      await writeAssets(next);
      setAssets(next);
    } catch (e: any) {
      setErr(e?.message || 'Asset upload failed.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeAsset = async (asset: StoredAsset) => {
    setBusy(true);
    setErr('');
    try {
      const next = assets.filter((a) => a.id !== asset.id);
      await writeAssets(next);
      setAssets(next);

      const path = asset.url.split('/assets/')[1];
      if (path) {
        await supabase.storage.from('assets').remove([path]);
      }
    } catch (e: any) {
      setErr(e?.message || 'Could not delete asset.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell>
      <PageHead kicker="ASSET MANAGER" title="Every visual in one place"
        sub="Upload logos, creatives, and docs once, then use them as campaign context automatically." />
      <div className="flex flex-wrap gap-2 mb-4">
        {FOLDERS.map(f => (
          <button key={f} onClick={() => setFolder(f)} className={`pill ${folder === f ? '!bg-gradient-to-r from-secondary to-primary !text-white !border-transparent' : ''}`}>{f}</button>
        ))}

        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => onUploadFiles(e.target.files)}
          accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt"
        />
        <button className="pill !border-dashed ml-auto" disabled={busy} onClick={() => fileRef.current?.click()}>{busy ? 'Uploading...' : '+ Upload'}</button>
        <button className="pill" disabled={busy} onClick={loadAssets}>Refresh</button>
      </div>

      {err && <p className="text-sm text-rose-500 mb-3">{err}</p>}
      {!err && <p className="text-xs text-stone mb-3">Assets saved: {assets.length}. Campaign Builder reads your latest uploaded assets for better strategy context.</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {list.map((asset) => (
          <div key={asset.id} className="glass !rounded-2xl overflow-hidden group">
            {asset.type.startsWith('image/') ? (
              <img src={asset.url} alt={asset.name} className="w-full aspect-square object-cover" />
            ) : (
              <div className="w-full aspect-square grid place-items-center bg-anti-flash-white text-bangladesh-green">
                <div className="text-center px-2">
                  <div className="text-2xl mb-1">DOC</div>
                  <div className="text-[11px] break-all">{asset.name}</div>
                </div>
              </div>
            )}
            <div className="p-2.5 flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-[11px] text-slate-600 truncate">{asset.name}</div>
                <div className="text-[10px] text-slate-500">{asset.folder} · {humanSize(asset.size)}</div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <a href={asset.url} target="_blank" rel="noreferrer" className="text-[12px]">Open</a>
                <button className="text-[12px] text-rose-500" onClick={() => removeAsset(asset)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {!busy && list.length === 0 && (
          <div className="glass p-10 text-center text-sm text-stone col-span-full">No assets yet. Upload files to use them in Campaign Builder strategy.</div>
        )}
      </div>
    </AppShell>
  );
}
