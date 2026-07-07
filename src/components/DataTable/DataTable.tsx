import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportCSV, exportExcel } from '../../utils/exportUtils';
import { Search, Download, FileSpreadsheet, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown } from 'lucide-react';

export default function DataTable() {
  const { state } = useApp();
  const { filteredData, data } = state;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDesc, setSortDesc] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const columns = data?.columns || [];

  // Search & Sort
  const processedData = useMemo(() => {
    let result = [...filteredData];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(row => 
        Object.values(row).some(val => 
          String(val || '').toLowerCase().includes(lowerSearch)
        )
      );
    }

    if (sortCol) {
      result.sort((a, b) => {
        const valA = a[sortCol];
        const valB = b[sortCol];
        
        if (valA === valB) return 0;
        if (valA === null || valA === undefined || valA === '') return 1;
        if (valB === null || valB === undefined || valB === '') return -1;
        
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDesc ? valB - valA : valA - valB;
        }
        
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortDesc ? strB.localeCompare(strA) : strA.localeCompare(strB);
      });
    }

    return result;
  }, [filteredData, searchTerm, sortCol, sortDesc]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = processedData.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      if (sortDesc) {
        setSortCol(null);
        setSortDesc(false);
      } else {
        setSortDesc(true);
      }
    } else {
      setSortCol(col);
      setSortDesc(false);
    }
  };

  const formatCell = (val: unknown) => {
    if (val === null || val === undefined) return '-';
    if (val instanceof Date) return val.toLocaleDateString('vi-VN');
    if (typeof val === 'number') {
      // If it looks like a year, don't format with commas
      if (val > 1900 && val < 2100 && Number.isInteger(val)) return val.toString();
      // Format decimals
      if (!Number.isInteger(val)) return val.toFixed(2);
      return val.toLocaleString('vi-VN');
    }
    return String(val);
  };

  return (
    <div className="surface-card flex flex-col h-[calc(100vh-140px)]">
      {/* Toolbar */}
      <div className="p-4 border-b border-[var(--color-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            placeholder="Tìm kiếm dữ liệu..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="input-field pl-9"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm text-[var(--color-text-secondary)] hidden md:inline">
            {processedData.length} kết quả
          </span>
          <button
            onClick={() => exportCSV(processedData, columns, 'hr_data_export')}
            className="btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-none"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            onClick={() => exportExcel(processedData, columns, 'hr_data_export')}
            className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-none"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase sticky top-0 z-10" 
            style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' }}>
            <tr>
              {columns.map(col => (
                <th key={col} className="px-4 py-3 font-semibold whitespace-nowrap border-b border-[var(--color-border)] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  onClick={() => handleSort(col)}>
                  <div className="flex items-center justify-between gap-2">
                    {col}
                    <ArrowUpDown className={`w-3 h-3 ${sortCol === col ? 'text-brand-500' : 'opacity-30'}`} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, i) => (
                <tr key={i} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors">
                  {columns.map(col => (
                    <td key={col} className="px-4 py-2.5 whitespace-nowrap">
                      {formatCell(row[col])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-[var(--color-text-secondary)]">
                  Không tìm thấy dữ liệu phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-3 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <span>Hiển thị</span>
          <select 
            value={pageSize} 
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="bg-transparent border border-[var(--color-border)] rounded px-1 py-0.5 outline-none"
          >
            {[10, 25, 50, 100].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span>dòng / trang</span>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setPage(1)} disabled={page === 1}
            className="p-1.5 rounded hover:bg-[var(--color-surface-hover)] disabled:opacity-30">
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-1.5 rounded hover:bg-[var(--color-surface-hover)] disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-3 py-1 font-medium text-[var(--color-brand)]">
            Trang {page} / {totalPages || 1}
          </span>
          
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="p-1.5 rounded hover:bg-[var(--color-surface-hover)] disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => setPage(totalPages)} disabled={page >= totalPages}
            className="p-1.5 rounded hover:bg-[var(--color-surface-hover)] disabled:opacity-30">
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
