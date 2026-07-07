import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Filter, ChevronDown, ChevronUp, RotateCcw, X } from 'lucide-react';

export default function Filters() {
  const { state, dispatch } = useApp();
  const { filters, filterOptions, data } = state;
  const [expanded, setExpanded] = useState(false);

  if (!data || !filterOptions) return null;
  const mapping = data.columnMapping;

  const hasActiveFilters =
    filters.departments.length > 0 ||
    filters.genders.length > 0 ||
    filters.hireYears.length > 0 ||
    (mapping.age && (filters.ageRange[0] > filterOptions.ageRange[0] || filters.ageRange[1] < filterOptions.ageRange[1])) ||
    (mapping.salary && (filters.salaryRange[0] > filterOptions.salaryRange[0] || filters.salaryRange[1] < filterOptions.salaryRange[1])) ||
    (mapping.performance_score && (filters.performanceRange[0] > filterOptions.performanceRange[0] || filters.performanceRange[1] < filterOptions.performanceRange[1])) ||
    (mapping.engagement_score && (filters.engagementRange[0] > filterOptions.engagementRange[0] || filters.engagementRange[1] < filterOptions.engagementRange[1]));

  const handleReset = () => {
    dispatch({
      type: 'RESET_FILTERS',
      payload: {
        departments: [],
        genders: [],
        ageRange: filterOptions.ageRange,
        salaryRange: filterOptions.salaryRange,
        hireYears: [],
        performanceRange: filterOptions.performanceRange,
        engagementRange: filterOptions.engagementRange,
      },
    });
  };

  const toggleDepartment = (dept: string) => {
    const current = filters.departments;
    const next = current.includes(dept) ? current.filter((d) => d !== dept) : [...current, dept];
    dispatch({ type: 'SET_FILTERS', payload: { departments: next } });
  };

  const toggleGender = (g: string) => {
    const current = filters.genders;
    const next = current.includes(g) ? current.filter((x) => x !== g) : [...current, g];
    dispatch({ type: 'SET_FILTERS', payload: { genders: next } });
  };

  const toggleHireYear = (y: number) => {
    const current = filters.hireYears;
    const next = current.includes(y) ? current.filter((x) => x !== y) : [...current, y];
    dispatch({ type: 'SET_FILTERS', payload: { hireYears: next } });
  };

  const activeCount = [
    filters.departments.length > 0,
    filters.genders.length > 0,
    filters.hireYears.length > 0,
    mapping.age && (filters.ageRange[0] > filterOptions.ageRange[0] || filters.ageRange[1] < filterOptions.ageRange[1]),
    mapping.salary && (filters.salaryRange[0] > filterOptions.salaryRange[0] || filters.salaryRange[1] < filterOptions.salaryRange[1]),
    mapping.performance_score && (filters.performanceRange[0] > filterOptions.performanceRange[0] || filters.performanceRange[1] < filterOptions.performanceRange[1]),
    mapping.engagement_score && (filters.engagementRange[0] > filterOptions.engagementRange[0] || filters.engagementRange[1] < filterOptions.engagementRange[1]),
  ].filter(Boolean).length;

  return (
    <div className="mb-6">
      {/* Filter toggle bar */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
        >
          <Filter className="w-4 h-4" />
          Bộ lọc
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-xs text-white gradient-brand">
              {activeCount}
            </span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-200 text-red-500 hover:bg-red-500/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Xóa bộ lọc
          </button>
        )}

        {/* Active filter chips */}
        <div className="flex flex-wrap gap-1.5">
          {filters.departments.map((d) => (
            <span key={d} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-brand-500/10 text-brand-500">
              {d}
              <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => toggleDepartment(d)} />
            </span>
          ))}
          {filters.genders.map((g) => (
            <span key={g} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-500">
              {g}
              <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => toggleGender(g)} />
            </span>
          ))}
        </div>

        {/* Data count */}
        <span className="ml-auto text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {state.filteredData.length} / {data.mapped.length} nhân viên
        </span>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="surface-card p-5 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {/* Department */}
            {mapping.department && filterOptions.departments.length > 0 && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                  style={{ color: 'var(--color-text-secondary)' }}>
                  Phòng ban
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {filterOptions.departments.map((d) => (
                    <button
                      key={d}
                      onClick={() => toggleDepartment(d)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                        filters.departments.includes(d)
                          ? 'gradient-brand text-white shadow-sm'
                          : ''
                      }`}
                      style={
                        !filters.departments.includes(d)
                          ? { background: 'var(--color-surface-hover)', color: 'var(--color-text)' }
                          : {}
                      }
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Gender */}
            {mapping.gender && filterOptions.genders.length > 0 && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                  style={{ color: 'var(--color-text-secondary)' }}>
                  Giới tính
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {filterOptions.genders.map((g) => (
                    <button
                      key={g}
                      onClick={() => toggleGender(g)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                        filters.genders.includes(g)
                          ? 'gradient-brand text-white shadow-sm'
                          : ''
                      }`}
                      style={
                        !filters.genders.includes(g)
                          ? { background: 'var(--color-surface-hover)', color: 'var(--color-text)' }
                          : {}
                      }
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Age Range */}
            {mapping.age && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                  style={{ color: 'var(--color-text-secondary)' }}>
                  Tuổi: {filters.ageRange[0]} - {filters.ageRange[1]}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={filterOptions.ageRange[0]}
                    max={filterOptions.ageRange[1]}
                    value={filters.ageRange[0]}
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_FILTERS',
                        payload: { ageRange: [Number(e.target.value), filters.ageRange[1]] },
                      })
                    }
                    className="flex-1 accent-brand-500"
                  />
                  <input
                    type="range"
                    min={filterOptions.ageRange[0]}
                    max={filterOptions.ageRange[1]}
                    value={filters.ageRange[1]}
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_FILTERS',
                        payload: { ageRange: [filters.ageRange[0], Number(e.target.value)] },
                      })
                    }
                    className="flex-1 accent-brand-500"
                  />
                </div>
              </div>
            )}

            {/* Salary Range */}
            {mapping.salary && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                  style={{ color: 'var(--color-text-secondary)' }}>
                  Lương: {filters.salaryRange[0].toLocaleString()} - {filters.salaryRange[1].toLocaleString()}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={filterOptions.salaryRange[0]}
                    max={filterOptions.salaryRange[1]}
                    step={Math.max(1, Math.round((filterOptions.salaryRange[1] - filterOptions.salaryRange[0]) / 100))}
                    value={filters.salaryRange[0]}
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_FILTERS',
                        payload: { salaryRange: [Number(e.target.value), filters.salaryRange[1]] },
                      })
                    }
                    className="flex-1 accent-brand-500"
                  />
                  <input
                    type="range"
                    min={filterOptions.salaryRange[0]}
                    max={filterOptions.salaryRange[1]}
                    step={Math.max(1, Math.round((filterOptions.salaryRange[1] - filterOptions.salaryRange[0]) / 100))}
                    value={filters.salaryRange[1]}
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_FILTERS',
                        payload: { salaryRange: [filters.salaryRange[0], Number(e.target.value)] },
                      })
                    }
                    className="flex-1 accent-brand-500"
                  />
                </div>
              </div>
            )}

            {/* Hire Year */}
            {mapping.hire_date && filterOptions.hireYears.length > 0 && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                  style={{ color: 'var(--color-text-secondary)' }}>
                  Năm tuyển dụng
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {filterOptions.hireYears.map((y) => (
                    <button
                      key={y}
                      onClick={() => toggleHireYear(y)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                        filters.hireYears.includes(y)
                          ? 'gradient-brand text-white shadow-sm'
                          : ''
                      }`}
                      style={
                        !filters.hireYears.includes(y)
                          ? { background: 'var(--color-surface-hover)', color: 'var(--color-text)' }
                          : {}
                      }
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Range */}
            {mapping.performance_score && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                  style={{ color: 'var(--color-text-secondary)' }}>
                  Performance: {filters.performanceRange[0]} - {filters.performanceRange[1]}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={filterOptions.performanceRange[0]}
                    max={filterOptions.performanceRange[1]}
                    step={0.1}
                    value={filters.performanceRange[0]}
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_FILTERS',
                        payload: { performanceRange: [Number(e.target.value), filters.performanceRange[1]] },
                      })
                    }
                    className="flex-1 accent-brand-500"
                  />
                  <input
                    type="range"
                    min={filterOptions.performanceRange[0]}
                    max={filterOptions.performanceRange[1]}
                    step={0.1}
                    value={filters.performanceRange[1]}
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_FILTERS',
                        payload: { performanceRange: [filters.performanceRange[0], Number(e.target.value)] },
                      })
                    }
                    className="flex-1 accent-brand-500"
                  />
                </div>
              </div>
            )}

            {/* Engagement Range */}
            {mapping.engagement_score && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                  style={{ color: 'var(--color-text-secondary)' }}>
                  Engagement: {filters.engagementRange[0]} - {filters.engagementRange[1]}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={filterOptions.engagementRange[0]}
                    max={filterOptions.engagementRange[1]}
                    step={0.1}
                    value={filters.engagementRange[0]}
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_FILTERS',
                        payload: { engagementRange: [Number(e.target.value), filters.engagementRange[1]] },
                      })
                    }
                    className="flex-1 accent-brand-500"
                  />
                  <input
                    type="range"
                    min={filterOptions.engagementRange[0]}
                    max={filterOptions.engagementRange[1]}
                    step={0.1}
                    value={filters.engagementRange[1]}
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_FILTERS',
                        payload: { engagementRange: [filters.engagementRange[0], Number(e.target.value)] },
                      })
                    }
                    className="flex-1 accent-brand-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
