import { useApp } from '../context/AppContext';
import UploadZone from '../components/Upload/UploadZone';
import { Moon, Sun, BarChart3 } from 'lucide-react';

export default function UploadPage() {
  const { state, dispatch } = useApp();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: state.theme === 'dark'
        ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)' }}>

      {/* Floating orbs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-float"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 animate-float"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', animationDelay: '3s' }} />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full opacity-10 animate-float"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', animationDelay: '1.5s' }} />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>HR Analytics</span>
        </div>
        <button
          onClick={() => dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' })}
          className="p-2.5 rounded-xl transition-all duration-200 hover:scale-110"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          title="Toggle theme"
        >
          {state.theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600" />
          )}
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-12">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--color-brand)' }}>
            <BarChart3 className="w-4 h-4" />
            Powered by AI
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight"
            style={{ color: 'var(--color-text)' }}>
            HR Analytics
            <span className="block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Kéo thả file Excel để bắt đầu phân tích dữ liệu nhân sự với AI
          </p>
        </div>

        <div className="w-full max-w-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <UploadZone />
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {[
            { icon: '📊', label: 'KPI Dashboard' },
            { icon: '📈', label: '13+ Biểu đồ' },
            { icon: '🤖', label: 'AI Analytics' },
            { icon: '📋', label: 'Export Report' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--color-text-secondary)' }}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
