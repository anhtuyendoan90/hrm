import { useMemo } from 'react';
import { useApp, getVal } from '../../context/AppContext';
import ChartWrapper from './ChartWrapper';

function getYear(v: unknown): number | null {
  if (v instanceof Date) return v.getFullYear();
  if (typeof v === 'number' && v > 1900 && v < 2100) return v;
  if (typeof v === 'string') {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d.getFullYear();
  }
  return null;
}

export default function HireTimelineChart() {
  const { state } = useApp();
  const { filteredData, data } = state;
  const mapping = data?.columnMapping;

  const option = useMemo(() => {
    if (!mapping || !mapping.hire_date) return {};
    
    const yearCounts = new Map<number, number>();
    
    filteredData.forEach(r => {
      const y = getYear(getVal(r, mapping, 'hire_date'));
      if (y !== null) {
        yearCounts.set(y, (yearCounts.get(y) || 0) + 1);
      }
    });

    const sortedYears = [...yearCounts.keys()].sort((a, b) => a - b);
    if (sortedYears.length === 0) return {};
    
    const minYear = sortedYears[0];
    const maxYear = sortedYears[sortedYears.length - 1];
    
    const fullYears: string[] = [];
    const values: number[] = [];
    
    for (let y = minYear; y <= maxYear; y++) {
      fullYears.push(y.toString());
      values.push(yearCounts.get(y) || 0);
    }

    return {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: fullYears },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Tuyển dụng',
          type: 'line',
          smooth: true,
          data: values,
          itemStyle: { color: '#6366f1' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(99,102,241,0.5)' },
                { offset: 1, color: 'rgba(99,102,241,0.05)' }
              ]
            }
          }
        }
      ]
    };
  }, [filteredData, mapping]);

  return <ChartWrapper title="Tuyển dụng theo năm" option={option} />;
}
