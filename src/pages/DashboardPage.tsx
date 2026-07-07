import { useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { calculateKPIs, applyFilters, getFilterOptions } from '../utils/dataProcessor';
import Header from '../components/Layout/Header';
import KPICards from '../components/Dashboard/KPICards';
import Filters from '../components/Dashboard/Filters';
import DepartmentChart from '../components/Charts/DepartmentChart';
import GenderChart from '../components/Charts/GenderChart';
import SalaryByDeptChart from '../components/Charts/SalaryByDeptChart';
import SalaryDistChart from '../components/Charts/SalaryDistChart';
import AgeDistChart from '../components/Charts/AgeDistChart';
import PerformanceChart from '../components/Charts/PerformanceChart';
import EngagementChart from '../components/Charts/EngagementChart';
import PromotionChart from '../components/Charts/PromotionChart';
import TrainingChart from '../components/Charts/TrainingChart';
import AbsenceChart from '../components/Charts/AbsenceChart';
import HireTimelineChart from '../components/Charts/HireTimelineChart';
import TerminationTimelineChart from '../components/Charts/TerminationTimelineChart';
import CorrelationHeatmap from '../components/Charts/CorrelationHeatmap';
import DataTable from '../components/DataTable/DataTable';
import AIReport from '../components/AI/AIReport';
import ChatPanel from '../components/AI/ChatPanel';

export default function DashboardPage() {
  const { state, dispatch } = useApp();
  const { data, filters, activeTab, chatOpen } = state;

  // Re-calculate filtered data & KPIs when filters change
  useEffect(() => {
    if (!data) return;
    const filtered = applyFilters(data.mapped, filters, data.columnMapping);
    dispatch({ type: 'SET_FILTERED_DATA', payload: filtered });
    const kpis = calculateKPIs(filtered, data.columnMapping);
    dispatch({ type: 'SET_KPIS', payload: kpis });
  }, [data, filters, dispatch]);

  const mapping = data?.columnMapping;
  const filteredData = state.filteredData;

  const overviewCharts = useMemo(() => {
    if (!mapping) return null;
    return (
      <>
        {mapping.department && <DepartmentChart />}
        {mapping.gender && <GenderChart />}
        {mapping.salary && mapping.department && <SalaryByDeptChart />}
        {mapping.salary && <SalaryDistChart />}
      </>
    );
  }, [mapping, filteredData]);

  const allCharts = useMemo(() => {
    if (!mapping) return null;
    return (
      <>
        {mapping.department && <DepartmentChart />}
        {mapping.gender && <GenderChart />}
        {mapping.salary && mapping.department && <SalaryByDeptChart />}
        {mapping.salary && <SalaryDistChart />}
        {mapping.age && <AgeDistChart />}
        {mapping.performance_score && <PerformanceChart />}
        {mapping.engagement_score && <EngagementChart />}
        {mapping.promotion_count && <PromotionChart />}
        {mapping.training_hours && <TrainingChart />}
        {mapping.absence_days && <AbsenceChart />}
        {mapping.hire_date && <HireTimelineChart />}
        {(mapping.termination_date || mapping.end_date) && <TerminationTimelineChart />}
        <CorrelationHeatmap />
      </>
    );
  }, [mapping, filteredData]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <Header />

      <div className="flex">
        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${chatOpen ? 'mr-[380px]' : ''}`}>
          <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-6">

            {/* Filters */}
            <Filters />

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="animate-fade-in">
                <KPICards />
                <div className="chart-grid mt-6">
                  {overviewCharts}
                </div>
              </div>
            )}

            {/* Charts Tab */}
            {activeTab === 'charts' && (
              <div className="animate-fade-in">
                <div className="chart-grid">
                  {allCharts}
                </div>
              </div>
            )}

            {/* Data Table Tab */}
            {activeTab === 'table' && (
              <div className="animate-fade-in">
                <DataTable />
              </div>
            )}

            {/* AI Report Tab */}
            {activeTab === 'ai' && (
              <div className="animate-fade-in">
                <AIReport />
              </div>
            )}
          </div>
        </main>

        {/* Chat Panel */}
        {chatOpen && <ChatPanel />}
      </div>
    </div>
  );
}
