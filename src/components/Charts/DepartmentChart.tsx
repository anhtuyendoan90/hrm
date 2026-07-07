import { useMemo } from 'react';
import { useApp, getStrVal } from '../../context/AppContext';
import ChartWrapper from './ChartWrapper';

export default function DepartmentChart() {
  const { state } = useApp();
  const { filteredData, data } = state;
  const mapping = data?.columnMapping;

  const option = useMemo(() => {
    if (!mapping || !mapping.department) return {};

    const deptCounts = new Map<string, number>();
    
    filteredData.forEach(row => {
      const dept = getStrVal(row, mapping, 'department');
      if (dept) {
        deptCounts.set(dept, (deptCounts.get(dept) || 0) + 1);
      }
    });

    const sorted = [...deptCounts.entries()]
      .sort((a, b) => b[1] - a[1]) // Sort descending
      .slice(0, 15); // Max 15 departments for clarity

    const names = sorted.map(item => item[0]);
    const values = sorted.map(item => item[1]);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
      },
      yAxis: {
        type: 'category',
        data: names.reverse(), // Reverse for horizontal bar chart (largest top)
        axisLabel: {
          width: 120,
          overflow: 'truncate'
        }
      },
      series: [
        {
          name: 'Số lượng nhân viên',
          type: 'bar',
          data: values.reverse(),
          itemStyle: {
            color: '#6366f1',
            borderRadius: [0, 4, 4, 0]
          },
          label: {
            show: true,
            position: 'right',
            color: 'inherit'
          }
        }
      ]
    };
  }, [filteredData, mapping]);

  return (
    <ChartWrapper 
      title="Nhân viên theo Phòng ban" 
      subtitle="Phân bố số lượng nhân sự"
      option={option} 
    />
  );
}
