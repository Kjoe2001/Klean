'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

const PLATFORMS = ['Instagram','TikTok','LinkedIn','X','Facebook','YouTube'];
const PCOLORS: any = { Instagram:'#EC4899', TikTok:'#0F172A', LinkedIn:'#0A66C2', X:'#334155', Facebook:'#1877F2', YouTube:'#FF0000' };

export default function Calendar() {
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [events, setEvents] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', platform: 'Instagram', date: '' });
  const load = () => supabase.from('calendar_events').select('*').then(({ data }) => setEvents(data || []));
  useEffect(() => { load(); }, []);

  const days = (() => {
    const first = new Date(month); const start = (first.getDay() + 6) % 7;
    const dim = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(start).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
  })();

  const add = async () => {
    if (!form.title || !form.date) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('calendar_events').insert({ user_id: user!.id, title: form.title, platform: form.platform, scheduled_at: new Date(form.date).toISOString() });
    setForm({ title: '', platform: 'Instagram', date: '' }); load();
  };

  const onDrop = async (e: React.DragEvent, day: number) => {
    const id = e.dataTransfer.getData('id'); if (!id) return;
    const d = new Date(month.getFullYear(), month.getMonth(), day, 10);
    await supabase.from('calendar_events').update({ scheduled_at: d.toISOString() }).eq('id', id); load();
  };

  return (
    <AppShell title="Content Calendar" subtitle="Plan, schedule and drag-and-drop your publishing month."
      actions={<div className="flex items-center gap-2">
        <button className="pill" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>←</button>
        <span className="font-sora font-bold text-sm w-36 text-center">{month.toLocaleString('en', { month: 'long', year: 'numeric' })}</span>
        <button className="pill" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>→</button>
      </div>}>
      <div className="glass p-5 mb-5 flex flex-wrap gap-3 items-center">
        <input className="field !w-64" placeholder="Post title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <select className="field !w-40" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
          {PLATFORMS.map(p => <option key={p}>{p}</option>)}
        </select>
        <input type="datetime-local" className="field !w-56" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        <button className="cta px-6 py-3 text-sm" onClick={add}>＋ Schedule</button>
        <span className="text-[11px] text-slate-400">Platform auto-publish (Meta/TikTok/X APIs) — see STATUS.md for the integration path.</span>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400 mb-2">
        {['MON','TUE','WED','THU','FRI','SAT','SUN'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => (
          <div key={i} onDragOver={e => e.preventDefault()} onDrop={e => d && onDrop(e, d)}
            className={`min-h-24 rounded-2xl p-2 ${d ? 'bg-white/70 dark:bg-white/5 shadow-glass' : ''}`}>
            {d && <div className="text-[11px] font-bold text-slate-400 mb-1">{d}</div>}
            {d && events.filter(ev => { const dt = new Date(ev.scheduled_at);
              return dt.getDate() === d && dt.getMonth() === month.getMonth() && dt.getFullYear() === month.getFullYear(); })
              .map(ev => (
                <div key={ev.id} draggable onDragStart={e => e.dataTransfer.setData('id', ev.id)}
                  className="text-[10px] text-white rounded-lg px-2 py-1 mb-1 cursor-grab truncate"
                  style={{ background: PCOLORS[ev.platform] || '#7C3AED' }}
                  onDoubleClick={async () => { await supabase.from('calendar_events').delete().eq('id', ev.id); load(); }}>
                  {ev.title}
                </div>))}
          </div>))}
      </div>
      <p className="text-[11px] text-slate-400 mt-3">Drag posts between days to reschedule · double-click to delete.</p>
    </AppShell>
  );
}
