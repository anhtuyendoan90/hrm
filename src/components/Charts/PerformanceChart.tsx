import { useMemo } from 'react';
import { useApp, getNumVal } from '../../context/AppContext';
import ChartWrapper from './ChartWrapper';

export default function PerformanceChart() {
  const { state } = useApp();
  const { filteredData, data } = state;
  const mapping = data?.columnMapping;

  const option = useMemo(() => {
    if (!mapping || !mapping.performance_score) return {};
    
    const counts = new Map<number, number>();
    filteredData.forEach(r => {
      const p = getNumVal(r, mapping, 'performance_score');
      if (p !== null) {
        counts.set(p, (counts.get(p) || 0) + 1);
      }
    });

    const sorted = [...counts.entries()].sort((a, b) => a[0] - b[0]);

    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { 
        type: 'category', 
        data: sorted.map(s => s[0].toString()),
        name: 'Điểm'
      },
      yAxis: { type: 'value', name: 'Số lượng' },
      series: [
        {
          name: 'Số lượng',
          type: 'bar',
          data: sorted.map(s => s[1]),
          itemStyle: { color: '#06b6d4', borderRadius: [4, 4, 0, 0] },
          label: { show: true, position: 'top' }
        }
      ]
    };
  }, [filteredData, mapping]);

  return <ChartWrapper title="Performance Score" option={option} />;
}
