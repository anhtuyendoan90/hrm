import { useMemo } from 'react';
import { useApp, getNumVal } from '../../context/AppContext';
import ChartWrapper from './ChartWrapper';

export default function TrainingChart() {
  const { state } = useApp();
  const { filteredData, data } = state;
  const mapping = data?.columnMapping;

  const option = useMemo(() => {
    if (!mapping || !mapping.training_hours) return {};
    
    const hours = filteredData
      .map(r => getNumVal(r, mapping, 'training_hours'))
      .filter((n): n is number => n !== null);
    
    if (hours.length === 0) return {};

    // Group into bins
    const bins = ['0-10h', '11-20h', '21-40h', '>40h'];
    const counts = [0, 0, 0, 0];
    
    hours.forEach(h => {
      if (h <= 10) counts[0]++;
      else if (h <= 20) counts[1]++;
      else if (h <= 40) counts[2]++;
      else counts[3]++;
    });

    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: bins },
      yAxis: { type: 'value', name: 'Số nhân viên' },
      series: [
        {
          name: 'Số nhân viên',
          type: 'bar',
          data: counts,
          itemStyle: { color: '#a855f7', borderRadius: [4, 4, 0, 0] },
          label: { show: true, position: 'top' }
        }
      ]
    };
  }, [filteredData, mapping]);

  return <ChartWrapper title="Giờ Đào tạo" option={option} />;
}
