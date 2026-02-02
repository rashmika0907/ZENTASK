
import React, { useState } from 'react';
import { User } from '../../types';

interface RegisterProps {
  onRegister: (user: User) => void;
  onNavigateToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onNavigateToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const mockUser: User = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      username,
      token: 'fake-jwt-token-' + Date.now(),
    };
    onRegister(mockUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fdfaf6]">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-stone-200/50 overflow-hidden p-10 border border-stone-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-emerald-900 tracking-tight mb-2">Join Zentask</h1>
          <p className="text-stone-500 font-medium">Begin your journey to focus</p>
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
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-stone-50/50 text-stone-900 font-medium placeholder-stone-300"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Confirm Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-stone-50/50 text-stone-900 font-medium placeholder-stone-300"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-emerald-900/10 transition-all transform hover:-translate-y-0.5 active:scale-95 mt-4"
          >
            Create Account
          </button>
        </form>

        <div className="mt-10 text-center text-sm text-stone-400">
          Already a member?{' '}
          <button
            onClick={onNavigateToLogin}
            className="text-emerald-700 font-bold hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
