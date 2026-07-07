import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateCorrelationMatrix } from '../../utils/dataProcessor';
import ChartWrapper from './ChartWrapper';

export default function CorrelationHeatmap() {
  const { state } = useApp();
  const { filteredData, data } = state;
  const mapping = data?.columnMapping;

  const option = useMemo(() => {
    if (!mapping) return {};
    
    const { labels, matrix } = calculateCorrelationMatrix(filteredData, mapping);
    
    if (labels.length < 2) return {};

    const heatmapData: [number, number, number][] = [];
    for (let i = 0; i < labels.length; i++) {
      for (let j = 0; j < labels.length; j++) {
        heatmapData.push([i, j, matrix[i][j]]);
      }
    }

    return {
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const x = labels[params.data[0]];
          const y = labels[params.data[1]];
          const val = params.data[2];
          return `${x} & ${y}: <b>${val}</b>`;
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: labels,
        splitArea: { show: true },
        axisLabel: { rotate: 45, interval: 0 }
      },
      yAxis: {
        type: 'category',
        data: labels,
        splitArea: { show: true }
      },
      visualMap: {
        min: -1,
        max: 1,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#ef4444', '#f8fafc', '#10b981'] // Red to White to Green
        },
        textStyle: {
          color: state.theme === 'dark' ? '#f8fafc' : '#0f172a'
        }
      },
      series: [
        {
          name: 'Correlation',
          type: 'heatmap',
          data: heatmapData,
          label: {
            show: true,
            formatter: (p: any) => p.data[2].toFixed(2),
            color: '#000' // Better contrast on both red/green
          },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' }
          }
        }
      ]
    };
  }, [filteredData, mapping, state.theme]);

  return <ChartWrapper title="Ma trận Tương quan (Heatmap)" height={450} option={option} />;
}
