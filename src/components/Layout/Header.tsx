import { useApp } from '../../context/AppContext';
import {
  BarChart3, Sun, Moon, LayoutDashboard, BarChart2,
  Table2, Brain, MessageCircle, Upload, X
} from 'lucide-react';

const tabs = [
  { key: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
  { key: 'charts', label: 'Biểu đồ', icon: BarChart2 },
  { key: 'table', label: 'Dữ liệu', icon: Table2 },
  { key: 'ai', label: 'AI Report', icon: Brain },
];

export default function Header() {
  const { state, dispatch } = useApp();

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{
        background: 'var(--glass-bg)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-[1800px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-md">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold hidden sm:block" style={{ color: 'var(--color-text)' }}>
              HR Analytics <span className="text-brand-500">Dashboard</span>
            </h1>
          </div>

          {/* Tabs */}
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = state.activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.key })}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-brand-500 bg-brand-500/10'
                      : 'hover:bg-[var(--color-surface-hover)]'
                  }`}
                  style={!active ? { color: 'var(--color-text-secondary)' } : {}}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Chat toggle */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_CHAT' })}
              className={`p-2 rounded-xl transition-all duration-200 relative ${
                state.chatOpen ? 'gradient-brand text-white shadow-md' : ''
              }`}
              style={!state.chatOpen ? { background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' } : {}}
              title="AI Chat"
            >
              {state.chatOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' })}
              className="p-2 rounded-xl transition-all duration-200 hover:scale-105"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              title="Toggle theme"
            >
              {state.theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>

            {/* New file */}
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'upload' })}
              className="p-2 rounded-xl transition-all duration-200 hover:scale-105"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              title="Upload file mới"
            >
              <Upload className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Warnings bar */}
      {state.data && state.data.warnings.length > 0 && (
        <div className="border-t px-4 py-2 text-xs flex flex-wrap gap-2"
          style={{ borderColor: 'var(--color-border)', background: 'rgba(245, 158, 11, 0.05)' }}>
          {state.data.warnings.map((w, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              ⚠️ {w}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
