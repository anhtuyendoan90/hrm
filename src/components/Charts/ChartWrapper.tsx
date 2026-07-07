import { ReactNode } from 'react';
import ReactECharts from 'echarts-for-react';
import { useApp } from '../../context/AppContext';
import { Maximize2, Download } from 'lucide-react';

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  option: any;
  height?: number | string;
  children?: ReactNode;
}

export default function ChartWrapper({
  title,
  subtitle,
  option,
  height = 350,
  children
}: ChartWrapperProps) {
  const { state } = useApp();
  const theme = state.theme === 'dark' ? 'dark' : 'light';

  // Base ECharts theme customization
  const baseOption = {
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: 'Inter, sans-serif',
    },
    tooltip: {
      backgroundColor: state.theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderColor: state.theme === 'dark' ? '#334155' : '#e2e8f0',
      textStyle: {
        color: state.theme === 'dark' ? '#f8fafc' : '#0f172a',
      },
      backdropFilter: 'blur(4px)',
      borderRadius: 8,
      padding: [12, 16],
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowBlur: 10,
    },
    grid: {
      top: 40,
      right: 20,
      bottom: 20,
      left: 20,
      containLabel: true,
    },
  };

  const finalOption = { ...baseOption, ...option };

  // Adjust axis colors based on theme if they exist
  if (finalOption.xAxis) {
    const axes = Array.isArray(finalOption.xAxis) ? finalOption.xAxis : [finalOption.xAxis];
    axes.forEach((axis: any) => {
      if (!axis.axisLine) axis.axisLine = {};
      if (!axis.axisLine.lineStyle) axis.axisLine.lineStyle = {};
      axis.axisLine.lineStyle.color = state.theme === 'dark' ? '#475569' : '#cbd5e1';
      
      if (!axis.splitLine) axis.splitLine = {};
      if (!axis.splitLine.lineStyle) axis.splitLine.lineStyle = {};
      axis.splitLine.lineStyle.color = state.theme === 'dark' ? '#1e293b' : '#f1f5f9';
      
      if (!axis.axisLabel) axis.axisLabel = {};
      axis.axisLabel.color = state.theme === 'dark' ? '#94a3b8' : '#64748b';
    });
  }

  if (finalOption.yAxis) {
    const axes = Array.isArray(finalOption.yAxis) ? finalOption.yAxis : [finalOption.yAxis];
    axes.forEach((axis: any) => {
      if (!axis.axisLine) axis.axisLine = {};
      if (!axis.axisLine.lineStyle) axis.axisLine.lineStyle = {};
      axis.axisLine.lineStyle.color = state.theme === 'dark' ? '#475569' : '#cbd5e1';
      
      if (!axis.splitLine) axis.splitLine = {};
      if (!axis.splitLine.lineStyle) axis.splitLine.lineStyle = {};
      axis.splitLine.lineStyle.color = state.theme === 'dark' ? '#1e293b' : '#f1f5f9';
      
      if (!axis.axisLabel) axis.axisLabel = {};
      axis.axisLabel.color = state.theme === 'dark' ? '#94a3b8' : '#64748b';
    });
  }

  return (
    <div className="surface-card flex flex-col relative group h-full">
      <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-start justify-between">
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h3>
          {subtitle && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Actions (visible on hover) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
          <button className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]" title="Export">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]" title="Expand">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-5 relative" style={{ minHeight: height }}>
        <ReactECharts
          option={finalOption}
          theme={theme === 'dark' ? 'dark' : undefined}
          style={{ height: '100%', width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
        />
        {children}
      </div>
    </div>
  );
}
