import { useMemo } from 'react';
import { useApp, getStrVal } from '../../context/AppContext';
import ChartWrapper from './ChartWrapper';

export default function GenderChart() {
  const { state } = useApp();
  const { filteredData, data } = state;
  const mapping = data?.columnMapping;

  const option = useMemo(() => {
    if (!mapping || !mapping.gender) return {};

    const counts = new Map<string, number>();
    
    filteredData.forEach(row => {
      const g = getStrVal(row, mapping, 'gender');
      if (g) {
        counts.set(g, (counts.get(g) || 0) + 1);
      }
    });

    const pieData = [...counts.entries()].map(([name, value]) => ({ name, value }));

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        textStyle: {
          color: state.theme === 'dark' ? '#94a3b8' : '#64748b'
        }
      },
      color: ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6'],
      series: [
        {
          name: 'Giới tính',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: state.theme === 'dark' ? '#1e293b' : '#ffffff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: pieData
        }
      ]
    };
  }, [filteredData, mapping, state.theme]);

  return (
    <ChartWrapper 
      title="Tỷ lệ Giới tính" 
      subtitle="Phân bố nam/nữ"
      option={option} 
    />
  );
}
