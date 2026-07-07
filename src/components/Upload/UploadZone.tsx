import { useState, useCallback, useRef, DragEvent, ChangeEvent } from 'react';
import { useApp } from '../../context/AppContext';
import { mapColumns } from '../../utils/columnMapper';
import { calculateKPIs, getFilterOptions, applyFilters } from '../../utils/dataProcessor';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function UploadZone() {
  const { dispatch } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.xlsx?$/i)) {
      setError('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

      const firstSheet = workbook.SheetNames[0];
      if (!firstSheet) {
        setError('File Excel không có sheet nào.');
        setLoading(false);
        return;
      }

      const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        workbook.Sheets[firstSheet],
        { defval: '' }
      );

      if (rawData.length === 0) {
        setError('File Excel không có dữ liệu.');
        setLoading(false);
        return;
      }

      // Map columns
      const mappedData = mapColumns(rawData);

      // Calculate initial filter options & KPIs
      const filterOptions = getFilterOptions(mappedData.mapped, mappedData.columnMapping);
      const initialFilters = {
        departments: [],
        genders: [],
        ageRange: filterOptions.ageRange,
        salaryRange: filterOptions.salaryRange,
        hireYears: [],
        performanceRange: filterOptions.performanceRange,
        engagementRange: filterOptions.engagementRange,
      };
      const filteredData = applyFilters(mappedData.mapped, initialFilters, mappedData.columnMapping);
      const kpis = calculateKPIs(filteredData, mappedData.columnMapping);

      // Dispatch all state updates
      dispatch({ type: 'SET_DATA', payload: mappedData });
      dispatch({ type: 'SET_FILTER_OPTIONS', payload: filterOptions });
      dispatch({ type: 'RESET_FILTERS', payload: initialFilters });
      dispatch({ type: 'SET_FILTERED_DATA', payload: filteredData });
      dispatch({ type: 'SET_KPIS', payload: kpis });

      setSuccess(true);
      setTimeout(() => {
        dispatch({ type: 'SET_VIEW', payload: 'dashboard' });
      }, 800);
    } catch (err) {
      console.error(err);
      setError('Không thể đọc file Excel. Vui lòng kiểm tra lại file.');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div
      className={`upload-zone glass-card p-12 text-center cursor-pointer transition-all duration-300 ${dragOver ? 'drag-over' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
      role="button"
      tabIndex={0}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />

      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 animate-spin text-brand-500" />
          <p className="text-lg font-medium" style={{ color: 'var(--color-text)' }}>
            Đang xử lý file...
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Nhận diện cột và phân tích dữ liệu
          </p>
        </div>
      ) : success ? (
        <div className="flex flex-col items-center gap-4">
          <CheckCircle className="w-16 h-16 text-emerald-500" />
          <p className="text-lg font-medium text-emerald-500">
            Tải lên thành công!
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Đang chuyển đến Dashboard...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            dragOver ? 'gradient-brand scale-110' : ''
          }`} style={!dragOver ? { background: 'var(--color-surface-hover)' } : {}}>
            {dragOver ? (
              <FileSpreadsheet className="w-10 h-10 text-white" />
            ) : (
              <Upload className="w-10 h-10" style={{ color: 'var(--color-text-secondary)' }} />
            )}
          </div>

          <div>
            <p className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
              {dragOver ? 'Thả file tại đây!' : 'Kéo thả file Excel vào đây'}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              hoặc click để chọn file • Hỗ trợ .xlsx, .xls
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
