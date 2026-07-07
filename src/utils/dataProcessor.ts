/**
 * dataProcessor.ts
 *
 * Calculates KPIs, applies filters, computes filter options, and
 * builds a correlation matrix from the mapped HR data.
 */

import type {
  ColumnMapping,
  KPIData,
  FilterState,
  FilterOptions,
} from '../context/AppContext';
import { getNumVal, getStrVal, getVal } from '../context/AppContext';

type Row = Record<string, unknown>;

/* ============================================================
   HELPERS
   ============================================================ */

function avg(nums: (number | null)[]): number | null {
  const valid = nums.filter((n): n is number => n !== null);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function isTerminated(row: Row, mapping: ColumnMapping): boolean {
  // Check termination_date first
  const termDate = getVal(row, mapping, 'termination_date');
  if (termDate !== undefined && termDate !== null && termDate !== '') {
    return true;
  }
  // Check end_date as fallback
  const endDate = getVal(row, mapping, 'end_date');
  if (endDate !== undefined && endDate !== null && endDate !== '') {
    return true;
  }
  return false;
}

function getYear(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date) {
    const y = v.getFullYear();
    return y > 1900 && y < 2100 ? y : null;
  }
  if (typeof v === 'number' && v > 1900 && v < 2100) return v;
  const str = String(v);
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    return y > 1900 && y < 2100 ? y : null;
  }
  const m = str.match(/(\d{4})/);
  return m ? Number(m[1]) : null;
}

/* ============================================================
   CALCULATE KPIs
   ============================================================ */

export function calculateKPIs(data: Row[], mapping: ColumnMapping): KPIData {
  const total = data.length;
  const terminated = data.filter((r) => isTerminated(r, mapping)).length;
  const active = total - terminated;
  const turnoverRate = total > 0 ? (terminated / total) * 100 : 0;

  return {
    totalEmployees: total,
    activeEmployees: active,
    terminatedEmployees: terminated,
    turnoverRate: Math.round(turnoverRate * 10) / 10,
    avgSalary: mapping.salary ? avg(data.map((r) => getNumVal(r, mapping, 'salary'))) : null,
    avgAge: mapping.age ? avg(data.map((r) => getNumVal(r, mapping, 'age'))) : null,
    avgTenure: mapping.tenure ? avg(data.map((r) => getNumVal(r, mapping, 'tenure'))) : null,
    avgPerformance: mapping.performance_score
      ? avg(data.map((r) => getNumVal(r, mapping, 'performance_score')))
      : null,
    avgEngagement: mapping.engagement_score
      ? avg(data.map((r) => getNumVal(r, mapping, 'engagement_score')))
      : null,
    avgAbsenceDays: mapping.absence_days
      ? avg(data.map((r) => getNumVal(r, mapping, 'absence_days')))
      : null,
    avgPromotion: mapping.promotion_count
      ? avg(data.map((r) => getNumVal(r, mapping, 'promotion_count')))
      : null,
    avgTrainingHours: mapping.training_hours
      ? avg(data.map((r) => getNumVal(r, mapping, 'training_hours')))
      : null,
  };
}

/* ============================================================
   APPLY FILTERS
   ============================================================ */

export function applyFilters(
  data: Row[],
  filters: FilterState,
  mapping: ColumnMapping
): Row[] {
  return data.filter((row) => {
    // Department filter
    if (filters.departments.length > 0 && mapping.department) {
      const dept = getStrVal(row, mapping, 'department');
      if (!filters.departments.includes(dept)) return false;
    }

    // Gender filter
    if (filters.genders.length > 0 && mapping.gender) {
      const gender = getStrVal(row, mapping, 'gender');
      if (!filters.genders.includes(gender)) return false;
    }

    // Age range filter
    if (mapping.age) {
      const age = getNumVal(row, mapping, 'age');
      if (age !== null) {
        if (age < filters.ageRange[0] || age > filters.ageRange[1]) return false;
      }
    }

    // Salary range filter
    if (mapping.salary) {
      const salary = getNumVal(row, mapping, 'salary');
      if (salary !== null) {
        if (salary < filters.salaryRange[0] || salary > filters.salaryRange[1]) return false;
      }
    }

    // Hire year filter
    if (filters.hireYears.length > 0 && mapping.hire_date) {
      const hd = getVal(row, mapping, 'hire_date');
      const year = getYear(hd);
      if (year !== null && !filters.hireYears.includes(year)) return false;
    }

    // Performance range filter
    if (mapping.performance_score) {
      const perf = getNumVal(row, mapping, 'performance_score');
      if (perf !== null) {
        if (perf < filters.performanceRange[0] || perf > filters.performanceRange[1]) return false;
      }
    }

    // Engagement range filter
    if (mapping.engagement_score) {
      const eng = getNumVal(row, mapping, 'engagement_score');
      if (eng !== null) {
        if (eng < filters.engagementRange[0] || eng > filters.engagementRange[1]) return false;
      }
    }

    return true;
  });
}

/* ============================================================
   GET FILTER OPTIONS (available choices from data)
   ============================================================ */

export function getFilterOptions(
  data: Row[],
  mapping: ColumnMapping
): FilterOptions {
  const departments = mapping.department
    ? [...new Set(data.map((r) => getStrVal(r, mapping, 'department')).filter(Boolean))].sort()
    : [];

  const genders = mapping.gender
    ? [...new Set(data.map((r) => getStrVal(r, mapping, 'gender')).filter(Boolean))].sort()
    : [];

  const ages = mapping.age
    ? data.map((r) => getNumVal(r, mapping, 'age')).filter((n): n is number => n !== null)
    : [];
  const ageRange: [number, number] =
    ages.length > 0 ? [Math.floor(Math.min(...ages)), Math.ceil(Math.max(...ages))] : [0, 100];

  const salaries = mapping.salary
    ? data.map((r) => getNumVal(r, mapping, 'salary')).filter((n): n is number => n !== null)
    : [];
  const salaryRange: [number, number] =
    salaries.length > 0
      ? [Math.floor(Math.min(...salaries)), Math.ceil(Math.max(...salaries))]
      : [0, 1000000];

  const hireYears = mapping.hire_date
    ? [
        ...new Set(
          data
            .map((r) => getYear(getVal(r, mapping, 'hire_date')))
            .filter((y): y is number => y !== null)
        ),
      ].sort()
    : [];

  const perfs = mapping.performance_score
    ? data
        .map((r) => getNumVal(r, mapping, 'performance_score'))
        .filter((n): n is number => n !== null)
    : [];
  const performanceRange: [number, number] =
    perfs.length > 0
      ? [Math.floor(Math.min(...perfs) * 10) / 10, Math.ceil(Math.max(...perfs) * 10) / 10]
      : [0, 10];

  const engs = mapping.engagement_score
    ? data
        .map((r) => getNumVal(r, mapping, 'engagement_score'))
        .filter((n): n is number => n !== null)
    : [];
  const engagementRange: [number, number] =
    engs.length > 0
      ? [Math.floor(Math.min(...engs) * 10) / 10, Math.ceil(Math.max(...engs) * 10) / 10]
      : [0, 10];

  return {
    departments,
    genders,
    ageRange,
    salaryRange,
    hireYears,
    performanceRange,
    engagementRange,
  };
}

/* ============================================================
   CORRELATION MATRIX
   ============================================================ */

export function calculateCorrelationMatrix(
  data: Row[],
  mapping: ColumnMapping
): { labels: string[]; matrix: number[][] } {
  const numericFields: { key: keyof ColumnMapping; label: string }[] = [
    { key: 'age', label: 'Age' },
    { key: 'salary', label: 'Salary' },
    { key: 'tenure', label: 'Tenure' },
    { key: 'performance_score', label: 'Performance' },
    { key: 'engagement_score', label: 'Engagement' },
    { key: 'absence_days', label: 'Absence' },
    { key: 'training_hours', label: 'Training' },
    { key: 'promotion_count', label: 'Promotion' },
  ];

  // Filter to only fields present in data
  const available = numericFields.filter((f) => mapping[f.key]);

  if (available.length < 2) {
    return { labels: [], matrix: [] };
  }

  const labels = available.map((f) => f.label);

  // Extract numeric vectors
  const vectors: number[][] = available.map((f) =>
    data.map((r) => getNumVal(r, mapping, f.key) ?? NaN)
  );

  // Pearson correlation
  const n = available.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1;
        continue;
      }
      const xi = vectors[i];
      const xj = vectors[j];

      // Filter paired valid values
      const pairs: [number, number][] = [];
      for (let k = 0; k < xi.length; k++) {
        if (!isNaN(xi[k]) && !isNaN(xj[k])) {
          pairs.push([xi[k], xj[k]]);
        }
      }

      if (pairs.length < 3) {
        matrix[i][j] = 0;
        continue;
      }

      const meanI = pairs.reduce((s, p) => s + p[0], 0) / pairs.length;
      const meanJ = pairs.reduce((s, p) => s + p[1], 0) / pairs.length;

      let cov = 0;
      let varI = 0;
      let varJ = 0;

      for (const [a, b] of pairs) {
        const di = a - meanI;
        const dj = b - meanJ;
        cov += di * dj;
        varI += di * di;
        varJ += dj * dj;
      }

      const denom = Math.sqrt(varI * varJ);
      matrix[i][j] = denom > 0 ? Math.round((cov / denom) * 100) / 100 : 0;
    }
  }

  return { labels, matrix };
}
