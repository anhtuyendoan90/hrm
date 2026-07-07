import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';

function AppInner() {
  const { state } = useApp();

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  return (
    <div className="min-h-screen transition-colors duration-300">
      {state.view === 'upload' ? <UploadPage /> : <DashboardPage />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
