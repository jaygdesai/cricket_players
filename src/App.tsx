import { useEffect } from 'react';
import Navbar from './components/ui/Navbar';
import AppRouter from './Router';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <div className="min-h-screen bg-slate-900 md:flex">
      <Navbar />
      <main className="flex-1 md:ml-20 lg:ml-64">
        <div className="max-w-6xl mx-auto">
          <AppRouter />
        </div>
      </main>
    </div>
  );
}

export default App;
