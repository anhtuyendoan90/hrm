/**
 * columnMapper.ts
 *
 * Intelligently maps arbitrary Excel column names to canonical HR field names
 * using fuzzy matching. Detects column types (date, number, text).
 */

import type { ColumnMapping, MappedData } from '../context/AppContext';

/* ============================================================
   CANONICAL FIELD DEFINITIONS
   Each entry has: canonical key, human label, and keyword patterns
   ============================================================ */

interface FieldDef {
  key: keyof ColumnMapping;
  label: string;
  patterns: RegExp[];
}

const FIELD_DEFS: FieldDef[] = [
  {
    key: 'employee_id',
    label: 'Employee ID',
    patterns: [
      /^(employee|emp|staff|worker|nhân\s*viên|nv).*(id|code|mã|number|no|số)/i,
      /^(id|mã|code).*(employee|emp|staff|nhân\s*viên|nv)/i,
      /^(emp_?id|employee_?id|staff_?id|emp_?code|ma_?nv|manv)$/i,
      /^id$/i,
    ],
  },
  {
    key: 'department',
    label: 'Department',
    patterns: [
      /^(department|dept|phòng\s*ban|phong\s*ban|đơn\s*vị|don\s*vi|division|unit|bộ\s*phận|bo\s*phan)/i,
    ],
  },
  {
    key: 'hire_date',
    label: 'Hire Date',
    patterns: [
      /^(hire|hiring|join|start|ngày\s*vào|ngay\s*vao|ngày\s*tuyển|entry|onboard|recruitment).*(date|ngày|ngay|time|day)/i,
      /^(date|ngày|ngay).*(hire|join|start|vào|tuyển|entry|onboard)/i,
      /^(hire_?date|join_?date|start_?date|ngayvao)$/i,
    ],
  },
  {
    key: 'termination_date',
    label: 'Termination Date',
    patterns: [
      /^(terminat|resign|quit|leave|exit|end|nghỉ\s*việc|nghi\s*viec|thôi\s*việc|sa\s*thải|off.?board).*(date|ngày|ngay|time|day)/i,
      /^(date|ngày|ngay).*(terminat|resign|quit|leave|exit|nghỉ|thôi)/i,
      /^(termination_?date|end_?date|resign_?date|leave_?date)$/i,
    ],
  },
  {
    key: 'end_date',
    label: 'End Date',
    patterns: [
      /^end.?date$/i,
      /^(contract|hợp\s*đồng).*(end|expir|hết\s*hạn)/i,
    ],
  },
  {
    key: 'tenure',
    label: 'Tenure',
    patterns: [
      /^(tenure|seniority|thâm\s*niên|tham\s*nien|years?.*(service|work|employ)|số\s*năm|so\s*nam)/i,
    ],
  },
  {
    key: 'gender',
    label: 'Gender',
    patterns: [
      /^(gender|sex|giới\s*tính|gioi\s*tinh|phái|phai|nam.?nữ)/i,
    ],
  },
  {
    key: 'age',
    label: 'Age',
    patterns: [
      /^(age|tuổi|tuoi|years?\s*old)/i,
    ],
  },
  {
    key: 'salary',
    label: 'Salary',
    patterns: [
      /^(salary|wage|pay|lương|luong|income|compensation|thu\s*nhập|earning|remuneration)/i,
      /salary/i,
    ],
  },
  {
    key: 'performance_score',
    label: 'Performance Score',
    patterns: [
      /^(performance|hiệu\s*suất|hieu\s*suat|đánh\s*giá|danh\s*gia|kết\s*quả|ket\s*qua).*(score|rating|điểm|diem|grade|rank|level)?/i,
      /^(score|rating|điểm|diem|grade).*(performance|hiệu\s*suất|đánh\s*giá)/i,
      /^(performance_?score|perf_?score|performance_?rating)$/i,
    ],
  },
  {
    key: 'absence_days',
    label: 'Absence Days',
    patterns: [
      /^(absence|absent|nghỉ|nghi|vắng|vang|leave|sick|off).*(day|ngày|ngay|count|số|so|hour)?/i,
      /^(day|ngày|ngay|số|so).*(absence|absent|nghỉ|vắng|leave|off)/i,
      /^(absence_?days|absent_?days|days_?absent|sick_?days|leave_?days)$/i,
    ],
  },
  {
    key: 'training_hours',
    label: 'Training Hours',
    patterns: [
      /^(training|đào\s*tạo|dao\s*tao|learn|education|development).*(hour|giờ|gio|time|duration)?/i,
      /^(hour|giờ|gio|time).*(training|đào\s*tạo|learn)/i,
      /^(training_?hours|train_?hours|training_?time)$/i,
    ],
  },
  {
    key: 'promotion_count',
    label: 'Promotion Count',
    patterns: [
      /^(promot|thăng\s*tiến|thang\s*tien|thăng\s*chức|advance).*(count|number|lần|lan|số|so|time)?/i,
      /^(count|number|lần|lan|số|so).*(promot|thăng|advance)/i,
      /^(promotion_?count|promotions|promo_?count)$/i,
    ],
  },
  {
    key: 'engagement_score',
    label: 'Engagement Score',
    patterns: [
      /^(engagement|engage|gắn\s*kết|gan\s*ket|hài\s*lòng|hai\s*long|satisf|commit|motivat).*(score|rating|điểm|diem|grade|level|index)?/i,
      /^(score|rating|điểm|diem).*(engagement|engage|gắn\s*kết|hài\s*lòng|satisf)/i,
      /^(engagement_?score|engage_?score|satisfaction_?score)$/i,
    ],
  },
];

/* ============================================================
   NORMALIZE COLUMN NAME
   ============================================================ */

function normalize(s: string): string {
  return s
    .trim()
    .replace(/[\(\)\[\]\{\}]/g, '')
    .replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\s_]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

/* ============================================================
   MAP COLUMN NAMES TO CANONICAL FIELDS
   ============================================================ */

function matchField(colName: string): keyof ColumnMapping | null {
  const cleaned = colName.trim();
  const normalized = normalize(cleaned);

  for (const def of FIELD_DEFS) {
    for (const pattern of def.patterns) {
      if (pattern.test(cleaned) || pattern.test(normalized)) {
        return def.key;
      }
    }
  }

  // Fallback: simple substring match on normalized name
  const fallbackMap: Record<string, keyof ColumnMapping> = {
    employee: 'employee_id',
    department: 'department',
    dept: 'department',
    hire: 'hire_date',
    termination: 'termination_date',
    tenure: 'tenure',
    gender: 'gender',
    sex: 'gender',
    age: 'age',
    salary: 'salary',
    wage: 'salary',
    performance: 'performance_score',
    absence: 'absence_days',
    training: 'training_hours',
    promotion: 'promotion_count',
    engagement: 'engagement_score',
  };

  for (const [keyword, field] of Object.entries(fallbackMap)) {
    if (normalized.includes(keyword)) {
      return field;
    }
  }

  return null;
}

/* ============================================================
   DETECT COLUMN TYPES
   ============================================================ */

function detectColumnType(
  values: unknown[]
): 'date' | 'number' | 'text' {
  const sample = values.slice(0, 50).filter((v) => v !== null && v !== undefined && v !== '');
  if (sample.length === 0) return 'text';

  let dateCount = 0;
  let numCount = 0;

  for (const v of sample) {
    if (v instanceof Date) {
      dateCount++;
      continue;
    }
    const str = String(v).trim();
    if (!str) continue;

    // Check if it's a number (handle commas as thousands separator)
    const numStr = str.replace(/,/g, '');
    if (!isNaN(Number(numStr)) && numStr !== '') {
      numCount++;
      continue;
    }

    // Check if it's a date-like string
    const datePatterns = [
      /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/,
      /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/,
      /^\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i,
      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}/i,
    ];
    if (datePatterns.some((p) => p.test(str))) {
      dateCount++;
    }
  }

  const threshold = sample.length * 0.6;
  if (dateCount > threshold) return 'date';
  if (numCount > threshold) return 'number';
  return 'text';
}

/* ============================================================
   PARSE DATE VALUES
   ============================================================ */

function parseDate(v: unknown): Date | null {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;

  // Handle Excel serial dates (number)
  if (typeof v === 'number') {
    // Excel serial date epoch is Jan 1, 1900
    const excelEpoch = new Date(1899, 11, 30);
    const msPerDay = 86400000;
    const d = new Date(excelEpoch.getTime() + v * msPerDay);
    return isNaN(d.getTime()) ? null : d;
  }

  const str = String(v).trim();
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/* ============================================================
   PARSE NUMERIC VALUES
   ============================================================ */

function parseNum(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return isNaN(v) ? null : v;
  const str = String(v).trim().replace(/[,$%]/g, '').replace(/\s/g, '');
  const n = Number(str);
  return isNaN(n) ? null : n;
}

/* ============================================================
   MAIN EXPORT: mapColumns
   ============================================================ */

export function mapColumns(rawData: Record<string, unknown>[]): MappedData {
  if (!rawData || rawData.length === 0) {
    return {
      raw: [],
      mapped: [],
      columns: [],
      columnMapping: {},
      warnings: ['File rỗng hoặc không có dữ liệu.'],
      columnTypes: {},
    };
  }

  const originalColumns = Object.keys(rawData[0]);
  const columnMapping: ColumnMapping = {};
  const usedFields = new Set<keyof ColumnMapping>();
  const columnTypes: Record<string, 'date' | 'number' | 'text'> = {};
  const warnings: string[] = [];

  // Step 1: Map each column
  for (const col of originalColumns) {
    const field = matchField(col);
    if (field && !usedFields.has(field)) {
      (columnMapping as Record<string, string>)[field] = col;
      usedFields.add(field);
    }
    // Detect type
    const values = rawData.map((r) => r[col]);
    columnTypes[col] = detectColumnType(values);
  }

  // Step 2: Generate warnings for missing fields
  const importantFields: { key: keyof ColumnMapping; label: string }[] = [
    { key: 'department', label: 'Department' },
    { key: 'salary', label: 'Salary' },
    { key: 'gender', label: 'Gender' },
    { key: 'age', label: 'Age' },
    { key: 'performance_score', label: 'Performance Score' },
    { key: 'engagement_score', label: 'Engagement Score' },
    { key: 'hire_date', label: 'Hire Date' },
    { key: 'termination_date', label: 'Termination Date' },
    { key: 'tenure', label: 'Tenure' },
    { key: 'absence_days', label: 'Absence Days' },
    { key: 'training_hours', label: 'Training Hours' },
    { key: 'promotion_count', label: 'Promotion Count' },
  ];

  for (const { key, label } of importantFields) {
    if (!columnMapping[key]) {
      warnings.push(`Không tìm thấy cột "${label}"`);
    }
  }

  // Step 3: Process/normalize data
  const mapped = rawData.map((row) => {
    const newRow: Record<string, unknown> = { ...row };

    // Convert date columns
    for (const [col, type] of Object.entries(columnTypes)) {
      if (type === 'date') {
        const parsed = parseDate(row[col]);
        if (parsed) newRow[col] = parsed;
      } else if (type === 'number') {
        const parsed = parseNum(row[col]);
        if (parsed !== null) newRow[col] = parsed;
      }
    }

    return newRow;
  });

  return {
    raw: rawData,
    mapped,
    columns: originalColumns,
    columnMapping,
    warnings,
    columnTypes,
  };
}
