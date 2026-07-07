import { useMemo } from 'react';
import { useApp, getNumVal } from '../../context/AppContext';
import ChartWrapper from './ChartWrapper';

export default function PromotionChart() {
  const { state } = useApp();
  const { filteredData, data } = state;
  const mapping = data?.columnMapping;

  const option = useMemo(() => {
    if (!mapping || !mapping.promotion_count) return {};
    
    const counts = new Map<number, number>();
    filteredData.forEach(r => {
      const p = getNumVal(r, mapping, 'promotion_count');
      if (p !== null) {
        counts.set(p, (counts.get(p) || 0) + 1);
      }
    });

    const sorted = [...counts.entries()].sort((a, b) => a[0] - b[0]);

    return {
      tooltip: { trigger: 'item' },
      legend: { top: 'bottom' },
      series: [
        {
          name: 'Số lần thăng tiến',
          type: 'pie',
          radius: [20, 100],
          center: ['50%', '50%'],
          roseType: 'area',
          itemStyle: { borderRadius: 8 },
          data: sorted.map(s => ({
            value: s[1],
            name: `${s[0]} lần`
          })),
          color: ['#94a3b8', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8']
        }
      ]
    };
  }, [filteredData, mapping]);

  return <ChartWrapper title="Phân bố Thăng tiến" option={option} />;
}
