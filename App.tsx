
import React, { useState, useEffect } from 'react';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import { AuthState, User } from './types';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  const [view, setView] = useState<'LOGIN' | 'REGISTER' | 'DASHBOARD'>('LOGIN');

  useEffect(() => {
    const savedUser = localStorage.getItem('zentask_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setAuth({ user, isAuthenticated: true, isLoading: false });
      setView('DASHBOARD');
    } else {
      setAuth(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const handleLogin = (user: User) => {
    localStorage.setItem('zentask_user', JSON.stringify(user));
    setAuth({ user, isAuthenticated: true, isLoading: false });
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    localStorage.removeItem('zentask_user');
    setAuth({ user: null, isAuthenticated: false, isLoading: false });
    setView('LOGIN');
  };

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (view === 'DASHBOARD' && auth.isAuthenticated && auth.user) {
    return <Dashboard user={auth.user} onLogout={handleLogout} />;
  }

  if (view === 'REGISTER') {
    return (
      <Register 
        onRegister={handleLogin} 
        onNavigateToLogin={() => setView('LOGIN')} 
      />
    );
  }

  return (
    <Login 
      onLogin={handleLogin} 
      onNavigateToRegister={() => setView('REGISTER')} 
    />
  );
};

export default App;
