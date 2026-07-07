import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateReport } from '../../utils/geminiApi';
import { downloadPDF, downloadDOCX, copyMarkdown, copyHTML } from '../../utils/exportUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Key, Brain, FileText, FileCode2, Copy, CopyCheck, AlertCircle } from 'lucide-react';

export default function AIReport() {
  const { state, dispatch } = useApp();
  const { apiKey, kpis, filteredData, data } = state;
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const handleGenerate = async () => {
    if (!apiKey) {
      setError('Vui lòng nhập Gemini API Key để tiếp tục.');
      return;
    }
    if (!kpis || !data) return;

    setLoading(true);
    setError(null);
    try {
      const result = await generateReport(apiKey, kpis, filteredData, data.columnMapping);
      setReport(result);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  const onCopyMd = async () => {
    await copyMarkdown(report);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const onCopyHtml = async () => {
    await copyHTML('ai-report-content');
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="surface-card p-6 min-h-[calc(100vh-140px)] flex flex-col">
      {/* Header & API Key */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-brand-500 mb-1">
            <Brain className="w-6 h-6" />
            AI Analytics Report
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Tự động tổng hợp và phân tích chuyên sâu dựa trên dữ liệu hiện tại bằng Google Gemini.
          </p>
        </div>

        <div className="flex w-full md:w-auto items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              placeholder="Nhập Gemini API Key..."
              value={apiKey}
              onChange={(e) => dispatch({ type: 'SET_API_KEY', payload: e.target.value })}
              className="input-field pl-9"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !apiKey}
            className="btn-primary whitespace-nowrap disabled:opacity-50"
          >
            {loading ? 'Đang phân tích...' : 'Tạo Báo Cáo'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 rounded-xl border p-6 overflow-auto" 
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
        
        {loading ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="h-10 skeleton w-1/2 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 skeleton w-full"></div>
              <div className="h-4 skeleton w-5/6"></div>
              <div className="h-4 skeleton w-4/6"></div>
            </div>
            <div className="h-6 skeleton w-1/3 mt-8 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 skeleton w-full"></div>
              <div className="h-4 skeleton w-full"></div>
              <div className="h-4 skeleton w-3/4"></div>
            </div>
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse-slow text-brand-500 flex flex-col items-center gap-3">
                <Brain className="w-12 h-12" />
                <span className="font-medium">AI đang xử lý dữ liệu và viết báo cáo...</span>
              </div>
            </div>
          </div>
        ) : report ? (
          <div className="relative max-w-4xl mx-auto">
            {/* Export Toolbar */}
            <div className="sticky top-0 float-right ml-4 mb-4 flex flex-col gap-2 p-2 rounded-xl backdrop-blur-md"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <button onClick={() => downloadPDF('ai-report-content', 'HR_Analytics_Report')}
                className="p-2 rounded-lg hover:bg-brand-500/10 text-brand-500 transition-colors" title="Download PDF">
                <FileText className="w-5 h-5" />
              </button>
              <button onClick={() => downloadDOCX(report, 'HR_Analytics_Report')}
                className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors" title="Download DOCX">
                <FileText className="w-5 h-5" />
              </button>
              <div className="w-full h-px bg-[var(--color-border)] my-1"></div>
              <button onClick={onCopyMd}
                className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-500 transition-colors" title="Copy Markdown">
                {copiedMd ? <CopyCheck className="w-5 h-5" /> : <FileCode2 className="w-5 h-5" />}
              </button>
              <button onClick={onCopyHtml}
                className="p-2 rounded-lg hover:bg-orange-500/10 text-orange-500 transition-colors" title="Copy HTML">
                {copiedHtml ? <CopyCheck className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            {/* Markdown Body */}
            <div id="ai-report-content" className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {report}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto opacity-60">
            <div className="w-16 h-16 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-[var(--color-text-secondary)]" />
            </div>
            <p className="text-lg font-medium" style={{ color: 'var(--color-text)' }}>Chưa có báo cáo</p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              Nhập API Key và bấm "Tạo Báo Cáo" để Gemini AI phân tích toàn diện dữ liệu HR của bạn.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
