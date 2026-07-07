import { useMemo } from 'react';
import { useApp, getStrVal, getNumVal } from '../../context/AppContext';
import ChartWrapper from './ChartWrapper';

export default function SalaryByDeptChart() {
  const { state } = useApp();
  const { filteredData, data } = state;
  const mapping = data?.columnMapping;

  const option = useMemo(() => {
    if (!mapping || !mapping.department || !mapping.salary) return {};

    const deptStats = new Map<string, { sum: number; count: number }>();
    
    filteredData.forEach(row => {
      const dept = getStrVal(row, mapping, 'department');
      const sal = getNumVal(row, mapping, 'salary');
      
      if (dept && sal !== null) {
        if (!deptStats.has(dept)) deptStats.set(dept, { sum: 0, count: 0 });
        const s = deptStats.get(dept)!;
        s.sum += sal;
        s.count += 1;
      }
    });

    const sorted = [...deptStats.entries()]
      .map(([name, stat]) => ({ name, avg: stat.sum / stat.count }))
      .sort((a, b) => b.avg - a.avg) // Sort descending by average
      .slice(0, 12); // Top 12

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const val = params[0].value;
          return `${params[0].name}<br/>Trị giá: <b>${Math.round(val).toLocaleString()}</b>`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: sorted.map(s => s.name),
        axisLabel: {
          interval: 0,
          rotate: 30,
          width: 80,
          overflow: 'truncate'
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
            return value;
          }
        }
      },
      series: [
        {
          name: 'Lương trung bình',
          type: 'bar',
          data: sorted.map(s => s.avg),
          itemStyle: {
            color: '#10b981',
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]
    };
  }, [filteredData, mapping]);

  return (
    <ChartWrapper 
      title="Lương trung bình theo Phòng ban" 
      option={option} 
    />
  );
}
