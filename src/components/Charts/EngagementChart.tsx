import { useMemo } from 'react';
import { useApp, getNumVal } from '../../context/AppContext';
import ChartWrapper from './ChartWrapper';

export default function EngagementChart() {
  const { state } = useApp();
  const { filteredData, data } = state;
  const mapping = data?.columnMapping;

  const option = useMemo(() => {
    if (!mapping || !mapping.engagement_score) return {};
    
    const counts = new Map<number, number>();
    filteredData.forEach(r => {
      const e = getNumVal(r, mapping, 'engagement_score');
      if (e !== null) {
        counts.set(e, (counts.get(e) || 0) + 1);
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
          type: 'line',
          smooth: true,
          areaStyle: {
            opacity: 0.3,
            color: '#f43f5e'
          },
          data: sorted.map(s => s[1]),
          itemStyle: { color: '#f43f5e' },
          symbolSize: 8
        }
      ]
    };
  }, [filteredData, mapping]);

  return <ChartWrapper title="Engagement Score" option={option} />;
}
