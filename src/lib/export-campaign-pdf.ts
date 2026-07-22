'use client';
import jsPDF from 'jspdf';

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;

const C = {
  headerBg: [3, 98, 76] as [number, number, number],
  accent: [0, 223, 129] as [number, number, number],
  rich: [2, 27, 26] as [number, number, number],
  body: [32, 48, 43] as [number, number, number],
  mute: [112, 125, 125] as [number, number, number],
  card: [245, 250, 249] as [number, number, number],
  border: [196, 224, 216] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

function setTextColor(doc: jsPDF, c: [number, number, number]) { doc.setTextColor(c[0], c[1], c[2]); }
function setFill(doc: jsPDF, c: [number, number, number]) { doc.setFillColor(c[0], c[1], c[2]); }
function setStroke(doc: jsPDF, c: [number, number, number]) { doc.setDrawColor(c[0], c[1], c[2]); }

function sanitize(input: unknown): string {
  return String(input ?? '')
    .replace(/\\r\\n|\\n|\\r/g, '\n')
    .normalize('NFKD')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[^\x20-\x7E\n\t]/g, '')
    .replace(/\s+$/gm, '')
    .trim();
}

function splitParagraphs(input: unknown): string[] {
  return sanitize(input).split(/\n+/).map((x) => x.trim()).filter(Boolean);
}

function drawHeader(doc: jsPDF, brand: string) {
  setFill(doc, C.headerBg);
  doc.rect(0, 0, PAGE_W, 22, 'F');

  setFill(doc, C.accent);
  doc.roundedRect(MARGIN, 5, 12, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setTextColor(doc, C.rich);
  doc.text('Z', MARGIN + 6, 13.2, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setTextColor(doc, C.white);
  doc.text('Zelvoo', MARGIN + 15, 12.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setTextColor(doc, [170, 203, 196] as any);
  doc.text(`${sanitize(brand)} | Campaign Plan`, PAGE_W - MARGIN, 12.8, { align: 'right' });

  setFill(doc, C.accent);
  doc.rect(0, 22, PAGE_W, 0.6, 'F');
}

function drawFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const y = PAGE_H - 8;
  setFill(doc, C.card);
  doc.rect(0, PAGE_H - 10, PAGE_W, 10, 'F');
  setTextColor(doc, C.mute);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Generated with Zelvoo | zelvoo.app', MARGIN, y);
  doc.text(`Page ${pageNum} of ${totalPages}`, PAGE_W - MARGIN, y, { align: 'right' });
}

function drawCard(doc: jsPDF, x: number, y: number, w: number, h: number) {
  setFill(doc, C.card);
  doc.roundedRect(x, y, w, h, 3, 3, 'F');
  setStroke(doc, C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 3, 3, 'S');
}

function drawSectionTitle(doc: jsPDF, y: number, title: string) {
  setFill(doc, C.headerBg);
  doc.roundedRect(MARGIN, y, CONTENT_W, 9.5, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.3);
  setTextColor(doc, C.accent);
  doc.text(sanitize(title).toUpperCase(), MARGIN + 4, y + 6.5);
}

function ensurePage(doc: jsPDF, y: number, needed: number): number {
  const bottomLimit = PAGE_H - MARGIN - 10;
  if (y + needed <= bottomLimit) return y;
  doc.addPage();
  return 30;
}

function drawParagraph(doc: jsPDF, x: number, y: number, text: unknown, maxWidth: number, size = 8.4, bold = false) {
  const paragraphs = splitParagraphs(text);
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setFontSize(size);
  setTextColor(doc, C.body);

  let cy = y;
  paragraphs.forEach((p, idx) => {
    const lines = doc.splitTextToSize(p, maxWidth);
    doc.text(lines, x, cy);
    cy += lines.length * 4.35;
    if (idx < paragraphs.length - 1) cy += 2.1;
  });
  return cy;
}

function bullets(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).map(sanitize).filter(Boolean);
}

export function exportCampaignPDF(report: any) {
  const request = report?.__request || {};
  const brand = sanitize(request.brand || request.name || 'Campaign');
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  let y = 30;

  drawHeader(doc, brand);

  setFill(doc, C.headerBg);
  doc.roundedRect(MARGIN, y, CONTENT_W, 34, 4, 4, 'F');
  setFill(doc, C.accent);
  doc.rect(MARGIN, y + 30, CONTENT_W, 0.6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  setTextColor(doc, C.white);
  doc.text('Campaign Plan', MARGIN + 6, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setTextColor(doc, [170, 203, 196] as any);
  doc.text(brand, MARGIN + 6, y + 19);

  const heroMeta = [request.objective, request.campaign_type, request.platform_mix].filter(Boolean).join(' | ');
  if (heroMeta) doc.text(sanitize(heroMeta), MARGIN + 6, y + 26);

  y += 40;

  const brief = [
    ['Budget', request.budget || '-'],
    ['Audience', request.audience || '-'],
    ['Region', request.region || '-'],
    ['Duration', request.duration_weeks ? `${request.duration_weeks} weeks` : '-'],
    ['Goal', request.goals || '-'],
    ['Offer', request.offer || '-'],
  ];

  y = ensurePage(doc, y, 40);
  drawCard(doc, MARGIN, y, CONTENT_W, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  setTextColor(doc, C.mute);
  doc.text('REQUEST BRIEF', MARGIN + 4, y + 6);

  let by = y + 11;
  brief.forEach(([label, value], idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const bx = MARGIN + 4 + col * ((CONTENT_W - 8) / 2);
    const yy = by + row * 8.4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    setTextColor(doc, C.mute);
    doc.text(sanitize(label), bx, yy);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.3);
    setTextColor(doc, C.rich);
    doc.text(sanitize(value).slice(0, 58), bx, yy + 4.4);
  });

  y += 42;

  const sections: Array<{ title: string; draw: () => number }> = [
    {
      title: 'Strategy',
      draw: () => {
        const lines = doc.splitTextToSize(sanitize(report?.strategy || ''), CONTENT_W - 8);
        const h = Math.max(16, lines.length * 4.4 + 8);
        y = ensurePage(doc, y, h + 3);
        drawSectionTitle(doc, y, 'Strategy');
        y += 11;
        drawCard(doc, MARGIN, y, CONTENT_W, h);
        y = drawParagraph(doc, MARGIN + 4, y + 6, report?.strategy || '', CONTENT_W - 8) + 5;
        return y;
      },
    },
    {
      title: 'Media Plan',
      draw: () => {
        const items = Array.isArray(report?.media_plan) ? report.media_plan : [];
        if (!items.length) return y;
        y = ensurePage(doc, y, 16);
        drawSectionTitle(doc, y, 'Media Plan');
        y += 11;
        items.forEach((m: any) => {
          const body = `${sanitize(m.channel)} | ${sanitize(m.share)}\n${sanitize(m.rationale)}`;
          const lines = doc.splitTextToSize(body, CONTENT_W - 8);
          const h = lines.length * 4.3 + 8;
          y = ensurePage(doc, y, h + 2);
          drawCard(doc, MARGIN, y, CONTENT_W, h);
          drawParagraph(doc, MARGIN + 4, y + 6, body, CONTENT_W - 8, 8.1, false);
          y += h + 2.5;
        });
        return y;
      },
    },
    {
      title: 'Content Plan',
      draw: () => {
        const items = Array.isArray(report?.content_plan) ? report.content_plan : [];
        if (!items.length) return y;
        y = ensurePage(doc, y, 16);
        drawSectionTitle(doc, y, 'Content Plan');
        y += 11;
        items.forEach((c: any) => {
          const text = `Week ${sanitize(c.week)}: ${sanitize(c.theme)}\nAssets: ${(Array.isArray(c.assets) ? c.assets : []).map(sanitize).join(', ')}`;
          const lines = doc.splitTextToSize(text, CONTENT_W - 8);
          const h = lines.length * 4.3 + 8;
          y = ensurePage(doc, y, h + 2);
          drawCard(doc, MARGIN, y, CONTENT_W, h);
          drawParagraph(doc, MARGIN + 4, y + 6, text, CONTENT_W - 8, 8.1, false);
          y += h + 2.5;
        });
        return y;
      },
    },
    {
      title: 'Creative Angles',
      draw: () => {
        const items = bullets(report?.creative_angles);
        if (!items.length) return y;
        y = ensurePage(doc, y, 16);
        drawSectionTitle(doc, y, 'Creative Angles');
        y += 11;
        items.forEach((item) => {
          const lines = doc.splitTextToSize(`- ${item}`, CONTENT_W - 8);
          const h = lines.length * 4.3 + 6;
          y = ensurePage(doc, y, h + 2);
          drawCard(doc, MARGIN, y, CONTENT_W, h);
          drawParagraph(doc, MARGIN + 4, y + 5, `- ${item}`, CONTENT_W - 8, 8.1, false);
          y += h + 2;
        });
        return y;
      },
    },
    {
      title: 'KPI Forecast',
      draw: () => {
        const items = Array.isArray(report?.kpi_forecast) ? report.kpi_forecast : [];
        if (!items.length) return y;
        y = ensurePage(doc, y, 16);
        drawSectionTitle(doc, y, 'KPI Forecast');
        y += 11;
        items.forEach((k: any) => {
          const line = `${sanitize(k.kpi)}: ${sanitize(k.target)}`;
          const lines = doc.splitTextToSize(line, CONTENT_W - 8);
          const h = lines.length * 4.3 + 7;
          y = ensurePage(doc, y, h + 2);
          drawCard(doc, MARGIN, y, CONTENT_W, h);
          drawParagraph(doc, MARGIN + 4, y + 5.5, line, CONTENT_W - 8, 8.1, false);
          y += h + 2;
        });
        return y;
      },
    },
    {
      title: 'Timeline',
      draw: () => {
        const items = Array.isArray(report?.timeline) ? report.timeline : [];
        if (!items.length) return y;
        y = ensurePage(doc, y, 16);
        drawSectionTitle(doc, y, 'Timeline');
        y += 11;
        items.forEach((t: any) => {
          const line = `${sanitize(t.weeks)} | ${sanitize(t.phase)}`;
          const lines = doc.splitTextToSize(line, CONTENT_W - 8);
          const h = lines.length * 4.3 + 7;
          y = ensurePage(doc, y, h + 2);
          drawCard(doc, MARGIN, y, CONTENT_W, h);
          drawParagraph(doc, MARGIN + 4, y + 5.5, line, CONTENT_W - 8, 8.1, false);
          y += h + 2;
        });
        return y;
      },
    },
    {
      title: 'Risk Controls',
      draw: () => {
        const items = bullets(report?.risk_controls);
        if (!items.length) return y;
        y = ensurePage(doc, y, 16);
        drawSectionTitle(doc, y, 'Risk Controls');
        y += 11;
        items.forEach((item) => {
          const lines = doc.splitTextToSize(`- ${item}`, CONTENT_W - 8);
          const h = lines.length * 4.3 + 6;
          y = ensurePage(doc, y, h + 2);
          drawCard(doc, MARGIN, y, CONTENT_W, h);
          drawParagraph(doc, MARGIN + 4, y + 5, `- ${item}`, CONTENT_W - 8, 8.1, false);
          y += h + 2;
        });
        return y;
      },
    },
  ];

  sections.forEach((s) => {
    s.draw();
    y += 2;
  });

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    if (i > 1) drawHeader(doc, brand);
    drawFooter(doc, i, total);
  }

  const stamp = Date.now();
  const filename = `${brand.replace(/\s+/g, '-').toLowerCase() || 'campaign'}-plan-${stamp}.pdf`;
  doc.save(filename);
}
