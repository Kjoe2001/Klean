'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import GlassCard from '@/components/GlassCard';
import Button from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';

const PLATFORMS = ['Instagram','TikTok','LinkedIn','X','Facebook','YouTube'];
const PCOLORS: any = { Instagram:'#EC4899', TikTok:'#0F172A', LinkedIn:'#0A66C2', X:'#334155', Facebook:'#1877F2', YouTube:'#FF0000' };

export default function Calendar() {
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [events, setEvents] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', platform: 'Instagram', date: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from('calendar_events').select('*');
    if (error) { setErr(error.message); return; }
    setErr('');
    setEvents(data || []);
  };
  useEffect(() => { load(); }, []);

  const days = (() => {
    const first = new Date(month); const start = (first.getDay() + 6) % 7;
    const dim = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(start).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
  })();

  const add = async () => {
    if (!form.title || !form.date) return;
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('calendar_events').insert({ user_id: user!.id, title: form.title, platform: form.platform, scheduled_at: new Date(form.date).toISOString() });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setForm({ title: '', platform: 'Instagram', date: '' });
    load();
  };

  const onDrop = async (e: React.DragEvent, day: number) => {
    const id = e.dataTransfer.getData('id'); if (!id) return;
    const d = new Date(month.getFullYear(), month.getMonth(), day, 10);
    const { error } = await supabase.from('calendar_events').update({ scheduled_at: d.toISOString() }).eq('id', id);
    if (error) { setErr(error.message); return; }
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('calendar_events').delete().eq('id', id);
    if (error) { setErr(error.message); return; }
    load();
  };

  return (
    <AppShell title="Content Calendar" subtitle="Plan, schedule and drag-and-drop your publishing month."
      actions={<div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>←</Button>
        <span className="font-heading font-semibold text-sm w-36 text-center text-rich-black">{month.toLocaleString('en', { month: 'long', year: 'numeric' })}</span>
        <Button variant="outline" size="sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>→</Button>
      </div>}>

      {err && (
        <div className="rounded-[12px] border border-danger/30 bg-danger/10 text-danger text-sm px-4 py-2.5 mb-4">{err}</div>
      )}

      <GlassCard className="mb-5 flex flex-wrap gap-3 items-end">
        <Input placeholder="Post title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="!w-64" />
        <Select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className="!w-40">
          {PLATFORMS.map(p => <option key={p}>{p}</option>)}
        </Select>
        <input type="datetime-local" className="field !w-56" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        <Button onClick={add} loading={busy}>＋ Schedule</Button>
        <span className="text-[11px] text-stone">Platform auto-publish (Meta/TikTok/X APIs) is a planned integration — see STATUS.md.</span>
      </GlassCard>

      <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-stone mb-2">
        {['MON','TUE','WED','THU','FRI','SAT','SUN'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => (
          <div key={i} onDragOver={e => e.preventDefault()} onDrop={e => d && onDrop(e, d)}
            className={`min-h-24 rounded-2xl p-2 ${d ? 'bg-white/70 border border-bangladesh-green/10' : ''}`}>
            {d && <div className="text-[11px] font-bold text-stone mb-1">{d}</div>}
            {d && events.filter(ev => { const dt = new Date(ev.scheduled_at);
              return dt.getDate() === d && dt.getMonth() === month.getMonth() && dt.getFullYear() === month.getFullYear(); })
              .map(ev => (
                <div key={ev.id} draggable onDragStart={e => e.dataTransfer.setData('id', ev.id)}
                  className="text-[10px] text-white rounded-lg px-2 py-1 mb-1 cursor-grab truncate"
                  style={{ background: PCOLORS[ev.platform] || '#7C3AED' }}
                  onDoubleClick={() => remove(ev.id)}>
                  {ev.title}
                </div>))}
          </div>))}
      </div>
      <p className="text-[11px] text-stone mt-3">Drag posts between days to reschedule · double-click to delete.</p>
    </AppShell>
  );
}
