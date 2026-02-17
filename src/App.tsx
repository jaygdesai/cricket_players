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
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="flex-1">
        <AppRouter />
      </main>
    </div>
  );
}

export default App;
