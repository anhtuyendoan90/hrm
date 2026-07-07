/**
 * exportUtils.ts
 *
 * Export utilities for CSV, Excel, PDF, DOCX, and clipboard operations.
 */

import { saveAs } from 'file-saver';

/* ============================================================
   EXPORT CSV
   ============================================================ */

export function exportCSV(
  data: Record<string, unknown>[],
  columns: string[],
  filename: string
): void {
  if (data.length === 0) return;

  const escapeCSV = (val: unknown): string => {
    const str = val === null || val === undefined ? '' : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map(escapeCSV).join(',');
  const rows = data.map((row) => columns.map((col) => escapeCSV(row[col])).join(','));
  const csv = [header, ...rows].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
}

/* ============================================================
   EXPORT EXCEL
   ============================================================ */

export async function exportExcel(
  data: Record<string, unknown>[],
  columns: string[],
  filename: string
): Promise<void> {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.json_to_sheet(data, { header: columns });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/* ============================================================
   DOWNLOAD PDF
   ============================================================ */

export async function downloadPDF(
  elementId: string,
  filename: string
): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const el = document.getElementById(elementId);
  if (!el) {
    console.error(`Element #${elementId} not found`);
    return;
  }

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF('p', 'mm', 'a4');
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${filename}.pdf`);
}

/* ============================================================
   DOWNLOAD DOCX
   ============================================================ */

export async function downloadDOCX(
  markdownText: string,
  filename: string
): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');

  const lines = markdownText.split('\n');
  const paragraphs: any[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^### /, ''),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (trimmed.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^## /, ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 360, after: 120 },
        })
      );
    } else if (trimmed.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^# /, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 480, after: 200 },
        })
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const text = trimmed.replace(/^[-*] /, '');
      const runs = parseBoldItalic(text, TextRun);
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: '• ' }), ...runs],
          spacing: { before: 60, after: 60 },
          indent: { left: 360 },
        })
      );
    } else if (trimmed === '---' || trimmed === '***') {
      paragraphs.push(new Paragraph({ text: '', spacing: { before: 200, after: 200 } }));
    } else if (trimmed === '') {
      paragraphs.push(new Paragraph({ text: '' }));
    } else {
      const runs = parseBoldItalic(trimmed, TextRun);
      paragraphs.push(new Paragraph({ children: runs, spacing: { before: 60, after: 60 } }));
    }
  }

  const doc = new Document({
    sections: [{ children: paragraphs }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}

function parseBoldItalic(text: string, TextRunClass: any): any[] {
  const parts: any[] = [];
  // Simple bold/italic parsing
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|([^*]+))/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      // Bold italic ***text***
      parts.push(new TextRunClass({ text: match[2], bold: true, italics: true }));
    } else if (match[3]) {
      // Bold **text**
      parts.push(new TextRunClass({ text: match[3], bold: true }));
    } else if (match[4]) {
      // Italic *text*
      parts.push(new TextRunClass({ text: match[4], italics: true }));
    } else if (match[5]) {
      parts.push(new TextRunClass({ text: match[5] }));
    }
  }

  if (parts.length === 0) {
    parts.push(new TextRunClass({ text }));
  }

  return parts;
}

/* ============================================================
   COPY MARKDOWN
   ============================================================ */

export async function copyMarkdown(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    fallbackCopy(text);
  }
}

/* ============================================================
   COPY HTML
   ============================================================ */

export async function copyHTML(elementId: string): Promise<void> {
  const el = document.getElementById(elementId);
  if (!el) return;

  try {
    const html = el.innerHTML;
    const blob = new Blob([html], { type: 'text/html' });
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': blob,
        'text/plain': new Blob([el.innerText], { type: 'text/plain' }),
      }),
    ]);
  } catch {
    fallbackCopy(el.innerText);
  }
}

function fallbackCopy(text: string): void {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}
