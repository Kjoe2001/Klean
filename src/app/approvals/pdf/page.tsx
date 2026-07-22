'use client';

import { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import AppShell from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { readApiResponse } from '@/lib/http';

async function getAccessToken() {
  let { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) return session.access_token;

  await supabase.auth.getUser();
  ({ data: { session } } = await supabase.auth.getSession());
  if (session?.access_token) return session.access_token;

  const refreshed = await supabase.auth.refreshSession();
  return refreshed.data.session?.access_token || null;
}

function renderApprovalPdf(approval: any) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Zelvoo Approval Review', 14, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const rows = [
    ['Workspace', approval.workspaceName || 'Workspace'],
    ['Requested By', approval.requestedBy || '-'],
    ['Status', approval.status || 'pending'],
    ['Source', approval.targetType === 'content-studio' ? 'Content Studio' : 'Campaign Builder'],
    ['Item', approval.title || 'Approval request'],
    ['Review Link', approval.targetLink || '-'],
    ['Requested At', approval.created_at ? new Date(approval.created_at).toLocaleString() : '-'],
  ];

  let y = 30;
  for (const [label, value] of rows) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 14, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(String(value || '-'), 150);
    doc.text(lines, 54, y);
    y += Math.max(8, lines.length * 5);
  }

  const noteHeaderY = y + 4;
  doc.setFont('helvetica', 'bold');
  doc.text('Requester Note:', 14, noteHeaderY);
  const noteLines = doc.splitTextToSize(String(approval.message || '-'), 180);
  doc.setFont('helvetica', 'normal');
  doc.text(noteLines, 14, noteHeaderY + 6);

  const reviewNoteY = noteHeaderY + 10 + noteLines.length * 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Review Note:', 14, reviewNoteY);
  const reviewLines = doc.splitTextToSize(String(approval.reviewNote || '-'), 180);
  doc.setFont('helvetica', 'normal');
  doc.text(reviewLines, 14, reviewNoteY + 6);

  doc.save(`approval-${approval.id || Date.now()}.pdf`);
}

export default function ApprovalPdfPage() {
  const [approval, setApproval] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const approvalId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || params.get('approvalId') || '';
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        if (!approvalId) throw new Error('Missing approval ID.');
        const token = await getAccessToken();
        if (!token) throw new Error('Please log in again.');
        const response = await fetch(`/api/approvals?approvalId=${encodeURIComponent(approvalId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await readApiResponse(response);
        setApproval(data.approval || null);
      } catch (e: any) {
        setError(e?.message || 'Could not load approval.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [approvalId]);

  return (
    <AppShell title="Approval PDF" subtitle="Open and download the exact request your teammate submitted.">
      <div className="glass-card-light glass-highlight p-6 rounded-3xl max-w-3xl">
        {loading && <p className="text-sm text-stone">Loading approval...</p>}
        {!!error && <p className="text-sm text-rose-500">{error}</p>}
        {!loading && !error && approval && (
          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-widest text-stone">Workspace</div>
            <div className="text-lg font-semibold text-rich-black">{approval.workspaceName}</div>
            <div className="text-sm text-stone">{approval.title}</div>
            {!!approval.message && <div className="text-sm text-stone">Requester note: {approval.message}</div>}
            <div className="flex gap-3 flex-wrap pt-2">
              {!!approval.targetLink && (
                <a href={approval.targetLink} className="pill" target={approval.targetLink.startsWith('http') ? '_blank' : undefined} rel={approval.targetLink.startsWith('http') ? 'noreferrer noopener' : undefined}>
                  Open source item
                </a>
              )}
              <button className="cta px-5 py-2.5 text-sm" onClick={() => renderApprovalPdf(approval)}>Download PDF</button>
              <a href="/workspaces" className="pill">Back to Workspaces</a>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
