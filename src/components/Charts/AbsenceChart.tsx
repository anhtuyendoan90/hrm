import { useMemo } from 'react';
import { useApp, getNumVal } from '../../context/AppContext';
import ChartWrapper from './ChartWrapper';

export default function AbsenceChart() {
  const { state } = useApp();
  const { filteredData, data } = state;
  const mapping = data?.columnMapping;

  const option = useMemo(() => {
    if (!mapping || !mapping.absence_days) return {};
    
    const days = filteredData
      .map(r => getNumVal(r, mapping, 'absence_days'))
      .filter((n): n is number => n !== null);
    
    if (days.length === 0) return {};

    const bins = ['0 ngày', '1-3 ngày', '4-7 ngày', '8-14 ngày', '>14 ngày'];
    const counts = [0, 0, 0, 0, 0];
    
    days.forEach(d => {
      if (d === 0) counts[0]++;
      else if (d <= 3) counts[1]++;
      else if (d <= 7) counts[2]++;
      else if (d <= 14) counts[3]++;
      else counts[4]++;
    });

    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { top: '5%', left: 'center' },
      series: [
        {
          name: 'Số ngày nghỉ',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: state.theme === 'dark' ? '#1e293b' : '#fff', borderWidth: 2 },
          label: { show: false, position: 'center' },
          emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
          labelLine: { show: false },
          data: bins.map((b, i) => ({ name: b, value: counts[i] })),
          color: ['#10b981', '#fbbf24', '#f59e0b', '#ea580c', '#ef4444']
        }
      ]
    };
  }, [filteredData, mapping, state.theme]);

  return <ChartWrapper title="Số ngày nghỉ phép" option={option} />;
}
