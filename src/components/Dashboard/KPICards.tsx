import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users, UserCheck, UserX, TrendingDown, DollarSign,
  Clock, Award, Heart, Calendar, GraduationCap, ArrowUpRight, Activity
} from 'lucide-react';

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  gradient: string;
  suffix?: string;
  delay?: number;
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = ref.current;
    const end = value;
    const duration = 1200;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        ref.current = end;
      }
    }

    requestAnimationFrame(animate);
  }, [value]);

  const isFloat = !Number.isInteger(value);
  const formatted = isFloat
    ? display.toFixed(1)
    : Math.round(display).toLocaleString('vi-VN');

  return <span>{formatted}{suffix}</span>;
}

function KPICard({ icon, label, value, gradient, suffix = '', delay = 0 }: KPICardProps) {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;

  return (
    <div
      className="glass-card p-5 animate-slide-up relative overflow-hidden group"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-[40px] opacity-20 ${gradient}`} />

      <div className="relative">
        <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center mb-3 shadow-md`}>
          {icon}
        </div>
        <p className="text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </p>
        <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          {!isNaN(numValue) ? (
            <AnimatedNumber value={numValue} suffix={suffix} />
          ) : (
            <span>{value}{suffix}</span>
          )}
        </p>
      </div>
    </div>
  );
}

export default function KPICards() {
  const { state } = useApp();
  const { kpis, data } = state;

  if (!kpis || !data) return null;

  const mapping = data.columnMapping;

  const cards: (KPICardProps | null)[] = [
    {
      icon: <Users className="w-5 h-5 text-white" />,
      label: 'Tổng nhân viên',
      value: kpis.totalEmployees,
      gradient: 'gradient-brand',
    },
    {
      icon: <UserCheck className="w-5 h-5 text-white" />,
      label: 'Đang làm việc',
      value: kpis.activeEmployees,
      gradient: 'gradient-emerald',
    },
    {
      icon: <UserX className="w-5 h-5 text-white" />,
      label: 'Đã nghỉ việc',
      value: kpis.terminatedEmployees,
      gradient: 'gradient-rose',
    },
    {
      icon: <TrendingDown className="w-5 h-5 text-white" />,
      label: 'Tỷ lệ nghỉ việc',
      value: kpis.turnoverRate,
      gradient: 'gradient-amber',
      suffix: '%',
    },
    kpis.avgSalary !== null && mapping.salary
      ? {
          icon: <DollarSign className="w-5 h-5 text-white" />,
          label: 'Lương trung bình',
          value: Math.round(kpis.avgSalary),
          gradient: 'gradient-cyan',
        }
      : null,
    kpis.avgAge !== null && mapping.age
      ? {
          icon: <Calendar className="w-5 h-5 text-white" />,
          label: 'Tuổi trung bình',
          value: kpis.avgAge,
          gradient: 'gradient-violet',
        }
      : null,
    kpis.avgTenure !== null && mapping.tenure
      ? {
          icon: <Clock className="w-5 h-5 text-white" />,
          label: 'Thâm niên TB',
          value: kpis.avgTenure,
          gradient: 'gradient-brand',
          suffix: ' năm',
        }
      : null,
    kpis.avgPerformance !== null && mapping.performance_score
      ? {
          icon: <Award className="w-5 h-5 text-white" />,
          label: 'Performance TB',
          value: kpis.avgPerformance,
          gradient: 'gradient-emerald',
        }
      : null,
    kpis.avgEngagement !== null && mapping.engagement_score
      ? {
          icon: <Heart className="w-5 h-5 text-white" />,
          label: 'Engagement TB',
          value: kpis.avgEngagement,
          gradient: 'gradient-rose',
        }
      : null,
    kpis.avgAbsenceDays !== null && mapping.absence_days
      ? {
          icon: <Activity className="w-5 h-5 text-white" />,
          label: 'Nghỉ phép TB',
          value: kpis.avgAbsenceDays,
          gradient: 'gradient-amber',
          suffix: ' ngày',
        }
      : null,
    kpis.avgPromotion !== null && mapping.promotion_count
      ? {
          icon: <ArrowUpRight className="w-5 h-5 text-white" />,
          label: 'Promotion TB',
          value: kpis.avgPromotion,
          gradient: 'gradient-cyan',
        }
      : null,
    kpis.avgTrainingHours !== null && mapping.training_hours
      ? {
          icon: <GraduationCap className="w-5 h-5 text-white" />,
          label: 'Training TB',
          value: kpis.avgTrainingHours,
          gradient: 'gradient-violet',
          suffix: 'h',
        }
      : null,
  ];

  const validCards = cards.filter((c): c is KPICardProps => c !== null);

  return (
    <div className="kpi-grid">
      {validCards.map((card, i) => (
        <KPICard key={card.label} {...card} delay={i * 50} />
      ))}
    </div>
  );
}
