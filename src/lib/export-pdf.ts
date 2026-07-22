'use client';
import jsPDF from 'jspdf';

// Brand palette
const C = {
  headerBg:   [3, 98, 76]   as [number, number, number],  // #03624C
  accent:     [0, 223, 129] as [number, number, number],  // #00DF81
  richBlack:  [2, 27, 26]   as [number, number, number],  // #021B1A
  bodyText:   [32, 48, 43]  as [number, number, number],  // dark body
  muted:      [112, 125, 125] as [number, number, number], // #707D7D
  cardBg:     [245, 250, 249] as [number, number, number], // near-white tint
  border:     [196, 224, 216] as [number, number, number], // light green border
  white:      [255, 255, 255] as [number, number, number],
  scorePurple:[124, 58, 237] as [number, number, number],
  scoreOrange:[255, 107, 44] as [number, number, number],
  scoreBlue:  [56, 189, 248] as [number, number, number],
  scoreGreen: [16, 185, 129] as [number, number, number],
};

const PAGE_W  = 210; // A4 mm
const MARGIN  = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;
const HEADER_H  = 22;
const FOOTER_H  = 10;
const BOTTOM_LIMIT = 297 - MARGIN - FOOTER_H; // A4 height minus margins

const SCORE_COLORS = {
  virality: C.scoreOrange,
  engagement: C.scorePurple,
  readability: C.scoreBlue,
  brandFit: C.scoreGreen,
} as const;

// Helpers

function sanitizeText(input: unknown): string {
  return String(input ?? '')
    .replace(/\\r\\n|\\n|\\r/g, '\n')
    .normalize('NFKD')
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201c/g, '"')
    .replace(/\u201d/g, '"')
    .replace(/\u2014|\u2013/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[^\x20-\x7E\n\t]/g, '')
    .replace(/[^A-Za-z0-9\s\n\t.,!?;:'"()\-/#&%+@|]/g, '')
    .replace(/\s*\|\s*/g, ' | ')
    .replace(/\s+$/gm, '')
    .trim();
}

function sanitizeLines(input: unknown): string {
  return sanitizeText(input).replace(/\s+/g, ' ');
}

function splitParagraphs(text: string): string[] {
  return sanitizeText(text)
    .split(/\n+/)
    .map(part => part.trim())
    .filter(Boolean);
}

function drawParagraphBlock(
  doc: jsPDF,
  x: number,
  y: number,
  text: string,
  maxWidth: number,
  options?: { fontSize?: number; color?: [number, number, number]; bold?: boolean; lineHeight?: number; paragraphGap?: number },
): number {
  const fontSize = options?.fontSize ?? 8.5;
  const lineHeight = options?.lineHeight ?? 4.4;
  const paragraphGap = options?.paragraphGap ?? 2.6;
  doc.setFont('helvetica', options?.bold ? 'bold' : 'normal');
  doc.setFontSize(fontSize);
  if (options?.color) setTextColor(doc, options.color);

  const paragraphs = splitParagraphs(text);
  let cy = y;

  paragraphs.forEach((paragraph, index) => {
    const lines = doc.splitTextToSize(paragraph, maxWidth);
    doc.text(lines, x, cy);
    cy += lines.length * lineHeight;
    if (index < paragraphs.length - 1) cy += paragraphGap;
  });

  return cy;
}

function setFill(doc: jsPDF, rgb: [number, number, number]) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}
function setStroke(doc: jsPDF, rgb: [number, number, number]) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}
function setTextColor(doc: jsPDF, rgb: [number, number, number]) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function drawHeader(doc: jsPDF, pageNum: number, brand: string) {
  setFill(doc, C.headerBg);
  doc.rect(0, 0, PAGE_W, HEADER_H, 'F');

  // Z badge
  setFill(doc, C.accent);
  doc.roundedRect(MARGIN, 5, 12, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setTextColor(doc, C.richBlack);
  doc.text('Z', MARGIN + 6, 13.2, { align: 'center' });

  // Zelvoo wordmark
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setTextColor(doc, C.white);
  doc.text('Zelvoo', MARGIN + 15, 12.8);

  // Brand name right side
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setTextColor(doc, [170, 203, 196] as any);
  doc.text(`${sanitizeText(brand)} | Content Pack`, PAGE_W - MARGIN, 12.8, { align: 'right' });

  // Accent line at bottom of header
  setFill(doc, C.accent);
  doc.rect(0, HEADER_H, PAGE_W, 0.6, 'F');
}

function drawFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const y = 297 - 8;
  setFill(doc, C.cardBg);
  doc.rect(0, 297 - FOOTER_H, PAGE_W, FOOTER_H, 'F');
  setTextColor(doc, C.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Generated with Zelvoo | zelvoo.app', MARGIN, y);
  doc.text(`Page ${pageNum} of ${totalPages}`, PAGE_W - MARGIN, y, { align: 'right' });
  doc.text(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), PAGE_W / 2, y, { align: 'center' });
}

function needsPage(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > BOTTOM_LIMIT) {
    doc.addPage();
    return HEADER_H + 8;
  }
  return y;
}

function drawCard(doc: jsPDF, x: number, y: number, w: number, h: number, accent = false) {
  setFill(doc, accent ? ([4, 42, 36] as any) : C.cardBg);
  doc.roundedRect(x, y, w, h, 3, 3, 'F');
  setStroke(doc, accent ? C.accent : C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 3, 3, 'S');
}

function drawSectionHeader(doc: jsPDF, y: number, label: string): number {
  y = needsPage(doc, y, 14);
  setFill(doc, C.headerBg);
  doc.roundedRect(MARGIN, y, CONTENT_W, 10, 2, 2, 'F');
  setTextColor(doc, C.accent);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(label.toUpperCase(), MARGIN + 4, y + 6.8);
  return y + 14;
}

function drawLabel(doc: jsPDF, x: number, y: number, text: string) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  setTextColor(doc, C.muted);
  doc.text(text.toUpperCase(), x, y);
}

function drawBodyText(doc: jsPDF, x: number, y: number, text: string, maxWidth: number): number {
  return drawParagraphBlock(doc, x, y, text, maxWidth, {
    fontSize: 8.5,
    color: C.bodyText,
    lineHeight: 4.5,
    paragraphGap: 2.2,
  });
}

function drawScoreBar(doc: jsPDF, x: number, y: number, w: number, label: string, value: number, color: [number, number, number]) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  setTextColor(doc, C.muted);
  doc.text(sanitizeText(label), x, y);
  // Track bar bg
  setFill(doc, [220, 236, 232] as any);
  doc.roundedRect(x, y + 1, w, 3, 1, 1, 'F');
  // Track bar fill
  setFill(doc, color);
  const fillW = Math.max(1, (value / 100) * w);
  doc.roundedRect(x, y + 1, fillW, 3, 1, 1, 'F');
  // Value label
  setTextColor(doc, color);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(`${value}`, x + w + 2, y + 4);
}

// ─── Content renderers ────────────────────────────────────────────────────────

function renderHooks(doc: jsPDF, y: number, d: any): number {
  const items: string[] = d.items || [];
  items.forEach((hook, i) => {
    const lines = doc.splitTextToSize(sanitizeText(hook), CONTENT_W - 18);
    const h = Math.max(10, lines.length * 4.8 + 6);
    y = needsPage(doc, y, h + 2);
    drawCard(doc, MARGIN, y, CONTENT_W, h);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    setTextColor(doc, C.accent);
    doc.text(`${i + 1}.`, MARGIN + 4, y + 6);
    doc.setFont('helvetica', 'normal');
    setTextColor(doc, C.bodyText);
    doc.text(lines, MARGIN + 12, y + 6);
    doc.setFont('helvetica', 'bold');
    y += h + 3;
  });
  return y + 2;
}

function renderPosts(doc: jsPDF, y: number, d: any): number {
  const items: any[] = d.items || [];
  items.forEach(p => {
    const titleLines = doc.splitTextToSize(sanitizeText(p.title || ''), CONTENT_W - 34);
    const ideaText = sanitizeText(p.idea || '');
    const ctaText = `CTA: ${sanitizeText(p.cta || '')}`;
    const ideaLines = ideaText ? Math.max(1, splitParagraphs(ideaText).reduce((count, paragraph) => count + doc.splitTextToSize(paragraph, CONTENT_W - 16).length, 0)) : 0;
    const ctaLines = ctaText ? Math.max(1, splitParagraphs(ctaText).reduce((count, paragraph) => count + doc.splitTextToSize(paragraph, CONTENT_W - 16).length, 0)) : 0;
    const h = Math.max(28, (titleLines.length + ideaLines + ctaLines) * 4.4 + 16);
    y = needsPage(doc, y, h);
    drawCard(doc, MARGIN, y, CONTENT_W, h);
    // Format badge
    setFill(doc, C.headerBg);
    doc.roundedRect(PAGE_W - MARGIN - 26, y + 3, 26, 6, 2, 2, 'F');
    setTextColor(doc, C.accent);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(sanitizeText(p.format || ''), PAGE_W - MARGIN - 13, y + 7.2, { align: 'center' });
    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    setTextColor(doc, C.richBlack);
    doc.text(titleLines, MARGIN + 4, y + 7);
    let cy = y + titleLines.length * 4.4 + 8;
    cy = drawParagraphBlock(doc, MARGIN + 4, cy, ideaText, CONTENT_W - 16, {
      fontSize: 7.8,
      color: C.muted,
      lineHeight: 4.4,
      paragraphGap: 2,
    });
    cy += 2.5;
    drawParagraphBlock(doc, MARGIN + 4, cy, ctaText, CONTENT_W - 16, {
      fontSize: 7.2,
      color: C.accent,
      bold: true,
      lineHeight: 4.2,
      paragraphGap: 1.8,
    });
    y += h + 3;
  });
  return y + 2;
}

function renderCaption(doc: jsPDF, y: number, d: any): number {
  (d.captions || []).forEach((cap: string, i: number) => {
    const lines = doc.splitTextToSize(sanitizeText(cap), CONTENT_W - 16);
    const h = lines.length * 4.4 + 13;
    y = needsPage(doc, y, h);
    drawCard(doc, MARGIN, y, CONTENT_W, h, false);
    drawLabel(doc, MARGIN + 4, y + 5.5, `Caption ${i + 1}`);
    drawParagraphBlock(doc, MARGIN + 4, y + 10, cap, CONTENT_W - 16, {
      fontSize: 8.1,
      color: C.bodyText,
      lineHeight: 4.4,
      paragraphGap: 2.1,
    });
    y += h + 3;
  });
  if ((d.hashtags || []).length) {
    const tags = (d.hashtags as string[]).map(t => `#${sanitizeText(t).replace(/^#/, '')}`).join('  ');
    const lines = doc.splitTextToSize(tags, CONTENT_W - 8);
    y = needsPage(doc, y, lines.length * 4.5 + 8);
    setTextColor(doc, C.accent);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.text(lines, MARGIN + 4, y);
    y += lines.length * 4.5 + 5;
  }
  return y;
}

function renderCarousel(doc: jsPDF, y: number, d: any): number {
  const slides: any[] = d.items || [];
  slides.forEach(s => {
    const titleLines = doc.splitTextToSize(sanitizeText(s.title || ''), CONTENT_W - 20);
    const bodyText = sanitizeText(s.body || '');
    const bodyLines = bodyText ? Math.max(1, splitParagraphs(bodyText).reduce((count, paragraph) => count + doc.splitTextToSize(paragraph, CONTENT_W - 16).length, 0)) : 0;
    const h = (titleLines.length + bodyLines) * 4.4 + 18;
    y = needsPage(doc, y, h);
    drawCard(doc, MARGIN, y, CONTENT_W, h, true);
    setFill(doc, C.accent);
    doc.roundedRect(MARGIN + 4, y + 4, 18, 6, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    setTextColor(doc, C.richBlack);
    doc.text(`SLIDE ${sanitizeText(s.slide)}`, MARGIN + 13, y + 8.4, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    setTextColor(doc, C.white);
    doc.text(titleLines, MARGIN + 4, y + 14);
    const cy = y + 14 + titleLines.length * 4.6;
    drawParagraphBlock(doc, MARGIN + 4, cy, bodyText, CONTENT_W - 16, {
      fontSize: 7.8,
      color: [170, 203, 196] as any,
      lineHeight: 4.4,
      paragraphGap: 2.1,
    });
    y += h + 3;
  });
  return y + 2;
}

function renderGeneric(doc: jsPDF, y: number, d: any): number {
  const raw = typeof d === 'string' ? d
    : JSON.stringify(d, null, 2)
        .replace(/[{}"]/g, '')
        .replace(/,$/gm, '')
        .replace(/^\s*\n/gm, '')
        .replace(/^\[|\]$/g, '');
  const paragraphs = splitParagraphs(raw.trim());
  const chunkSize = 14;
  for (let i = 0; i < paragraphs.length; i += chunkSize) {
    const chunk = paragraphs.slice(i, i + chunkSize);
    const chunkText = chunk.join('\n\n');
    const renderedLines = doc.splitTextToSize(chunkText, CONTENT_W - 10);
    const h = renderedLines.length * 4.35 + 10;
    y = needsPage(doc, y, h);
    drawCard(doc, MARGIN, y, CONTENT_W, h);
    drawParagraphBlock(doc, MARGIN + 4, y + 6, chunkText, CONTENT_W - 10, {
      fontSize: 7.8,
      color: C.bodyText,
      lineHeight: 4.35,
      paragraphGap: 2.2,
    });
    y += h + 3;
  }
  return y + 2;
}

function renderScores(doc: jsPDF, y: number, score: any): number {
  if (!score) return y;
  const barW = (CONTENT_W / 4) - 6;
  const metrics = [
    { label: 'Virality',   value: score.virality   || 0, color: SCORE_COLORS.virality },
    { label: 'Engagement', value: score.engagement || 0, color: SCORE_COLORS.engagement },
    { label: 'Readability',value: score.readability|| 0, color: SCORE_COLORS.readability },
    { label: 'Brand Fit',  value: score.brand_fit  || 0, color: SCORE_COLORS.brandFit },
  ];
  y = needsPage(doc, y, 14);
  metrics.forEach((m, i) => {
    const x = MARGIN + i * (barW + 6);
    drawScoreBar(doc, x, y, barW, m.label, m.value, m.color);
  });
  if (score.verdict) {
    y += 11;
    const verdictText = sanitizeText(score.verdict);
    const verdictLines = doc.splitTextToSize(verdictText, CONTENT_W - 8);
    y = needsPage(doc, y, verdictLines.length * 4.4 + 4);
    drawParagraphBlock(doc, MARGIN + 4, y, verdictText, CONTENT_W - 8, {
      fontSize: 7.2,
      color: C.muted,
      lineHeight: 4.4,
      paragraphGap: 1.8,
    });
    y += verdictLines.length * 4.4 + 2;
  } else {
    y += 10;
  }
  return y;
}

// ─── Main export function ─────────────────────────────────────────────────────

export interface ExportBrief {
  brand: string;
  industry: string;
  audience: string;
  tone: string;
  platform: string;
  focus?: string;
}

export interface ContentType {
  id: string;
  icon: string;
  label: string;
}

export function exportContentPDF(
  brief: ExportBrief,
  results: Record<string, any>,
  scores: Record<string, any>,
  contentTypes: ContentType[],
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  const activeTypes = contentTypes.filter(t => results[t.id] && !results[t.id].__error);
  let y = HEADER_H + 8;

  // ── Cover / Brief ──────────────────────────────────────────────────────────
  drawHeader(doc, 1, brief.brand);

  // Cover hero card
  setFill(doc, C.headerBg);
  doc.roundedRect(MARGIN, y, CONTENT_W, 38, 4, 4, 'F');
  setFill(doc, C.accent);
  doc.rect(MARGIN, y + 34, CONTENT_W, 0.6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  setTextColor(doc, C.white);
  doc.text('Content Pack', MARGIN + 6, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setTextColor(doc, [170, 203, 196] as any);
  doc.text(sanitizeText(brief.brand), MARGIN + 6, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setTextColor(doc, [112, 168, 152] as any);
  doc.text(`${activeTypes.length} content type${activeTypes.length !== 1 ? 's' : ''} | ${activeTypes.map(t => t.label).join(', ')}`, MARGIN + 6, y + 28);

  y += 44;

  // Brief summary card
  y = needsPage(doc, y, 36);
  drawCard(doc, MARGIN, y, CONTENT_W, 36);

  // Pill label
  setFill(doc, C.accent);
  doc.roundedRect(MARGIN + 4, y + 4, 22, 6, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  setTextColor(doc, C.richBlack);
  doc.text('BRIEF', MARGIN + 15, y + 8.4, { align: 'center' });

  const halfW = (CONTENT_W - 12) / 2;
  const fields = [
    ['Brand',    brief.brand],
    ['Industry', brief.industry],
    ['Audience', brief.audience],
    ['Tone',     brief.tone],
    ['Platform', brief.platform],
    ['Focus',    brief.focus || '—'],
  ];
  fields.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const fx = MARGIN + 4 + col * (halfW + 6);
    const fy = y + 14 + row * 8;
    drawLabel(doc, fx, fy, label);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setTextColor(doc, C.richBlack);
    doc.text(sanitizeText(String(value || '-')).slice(0, 40), fx, fy + 4.5);
  });

  y += 42;

  // ── Content sections ───────────────────────────────────────────────────────
  activeTypes.forEach(t => {
    y = needsPage(doc, y, 20);
    y = drawSectionHeader(doc, y, t.label);

    const d = results[t.id];
    if (t.id === 'hooks')   y = renderHooks(doc, y, d);
    else if (t.id === 'post')    y = renderPosts(doc, y, d);
    else if (t.id === 'caption') y = renderCaption(doc, y, d);
    else if (t.id === 'carousel') y = renderCarousel(doc, y, d);
    else y = renderGeneric(doc, y, d);

    if (scores[t.id]) {
      y = needsPage(doc, y, 24);
      drawCard(doc, MARGIN, y, CONTENT_W, 14);
      drawLabel(doc, MARGIN + 4, y + 5.5, 'AI Score');
      y += 8;
      y = renderScores(doc, y, scores[t.id]);
      y += 8;
    }

    y += 4;
  });

  // ── Retroactively add page numbers once total is known ────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) drawHeader(doc, i, brief.brand);
    drawFooter(doc, i, totalPages);
  }

  // Save
  const filename = `${brief.brand.replace(/\s+/g, '-').toLowerCase()}-content-pack-${Date.now()}.pdf`;
  doc.save(filename);
}
