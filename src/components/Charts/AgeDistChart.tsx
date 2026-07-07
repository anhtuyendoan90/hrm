import { useMemo } from 'react';
import { useApp, getNumVal } from '../../context/AppContext';
import ChartWrapper from './ChartWrapper';

function createHistogramOptions(data: number[], bins: number = 10, color: string) {
  if (data.length === 0) return {};
  const min = Math.floor(Math.min(...data));
  const max = Math.ceil(Math.max(...data));
  const binWidth = (max - min) / bins;

  const histogram = new Array(bins).fill(0);
  data.forEach(val => {
    let binIndex = Math.floor((val - min) / binWidth);
    if (binIndex >= bins) binIndex = bins - 1;
    histogram[binIndex]++;
  });

  const xAxisData = histogram.map((_, i) => {
    return `${Math.round(min + i * binWidth)}-${Math.round(min + (i + 1) * binWidth)}`;
  });

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: { type: 'category', data: xAxisData },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Số người',
        type: 'bar',
        barWidth: '95%',
        data: histogram,
        itemStyle: { color, borderRadius: [4, 4, 0, 0] }
      }
    ]
  };
}

export default function AgeDistChart() {
  const { state } = useApp();
  const { filteredData, data } = state;
  const mapping = data?.columnMapping;

  const option = useMemo(() => {
    if (!mapping || !mapping.age) return {};
    const ages = filteredData
      .map(r => getNumVal(r, mapping, 'age'))
      .filter((n): n is number => n !== null);
    
    return createHistogramOptions(ages, 10, '#8b5cf6');
  }, [filteredData, mapping]);

  return <ChartWrapper title="Phân bố Độ tuổi" option={option} />;
}
