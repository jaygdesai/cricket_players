import { useEffect, useState } from 'react';
import Navbar from './components/ui/Navbar';
import AppRouter from './Router';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const initAuth = useAuthStore((s) => s.initAuth);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
      <main
        className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}
      >
        <div className="max-w-6xl mx-auto">
          <AppRouter />
        </div>
      </main>
    </div>
  );
}

export default App;
