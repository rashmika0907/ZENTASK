
import React, { useState } from 'react';
import { User } from '../../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigateToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    const mockUser: User = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      username,
      token: 'fake-jwt-token-' + Date.now(),
    };
    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fdfaf6]">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-stone-200/50 overflow-hidden p-10 border border-stone-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-emerald-900 tracking-tight mb-2">Zentask</h1>
          <p className="text-stone-500 font-medium">Return to your focus</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-orange-50 text-orange-800 p-3 rounded-xl text-sm font-semibold border border-orange-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Username</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-stone-50/50 text-stone-900 font-medium placeholder-stone-300"
              placeholder="Your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-stone-50/50 text-stone-900 font-medium placeholder-stone-300"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-emerald-900/10 transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            Enter Workspace
          </button>
        </form>

        <div className="mt-10 text-center text-sm text-stone-400">
          New here?{' '}
          <button
            onClick={onNavigateToRegister}
            className="text-emerald-700 font-bold hover:underline"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
