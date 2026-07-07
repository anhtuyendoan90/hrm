import { useMemo } from 'react';
import { useApp, getNumVal } from '../../context/AppContext';
import ChartWrapper from './ChartWrapper';

function createHistogramOptions(data: number[], bins: number = 10, color: string, title: string) {
  if (data.length === 0) return {};

  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / bins;

  const histogram = new Array(bins).fill(0);
  data.forEach(val => {
    let binIndex = Math.floor((val - min) / binWidth);
    if (binIndex >= bins) binIndex = bins - 1;
    histogram[binIndex]++;
  });

  const xAxisData = histogram.map((_, i) => {
    const start = min + i * binWidth;
    const end = start + binWidth;
    return `${Math.round(start)} - ${Math.round(end)}`;
  });

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: { rotate: 45 }
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Số lượng',
        type: 'bar',
        barWidth: '99%',
        data: histogram,
        itemStyle: { color }
      }
    ]
  };
}

export default function SalaryDistChart() {
  const { state } = useApp();
  const { filteredData, data } = state;
  const mapping = data?.columnMapping;

  const option = useMemo(() => {
    if (!mapping || !mapping.salary) return {};
    const salaries = filteredData
      .map(r => getNumVal(r, mapping, 'salary'))
      .filter((n): n is number => n !== null);
    
    return createHistogramOptions(salaries, 15, '#f59e0b', 'Phân bố Lương');
  }, [filteredData, mapping]);

  return <ChartWrapper title="Phân bố Lương" option={option} />;
}
