import { useState } from 'react';
import { Lock, Mail, AlertCircle, Shield } from 'lucide-react';
import { login } from '../utils/auth';
import type { AuthState } from '../types';

export default function Login({ onLogin }: { onLogin: (auth: AuthState) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const auth = await login(email, password);
      onLogin(auth);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 mb-4">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">NLPR</h1>
          <p className="text-gray-400 mt-2">NL Periodic Review Tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-navy-800 rounded-2xl p-8 shadow-2xl border border-navy-700">
          <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="admin@silverbacking.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>

          <div className="mt-6 p-3 rounded-lg bg-navy-900/50 border border-navy-700">
            <p className="text-xs text-gray-400 font-medium mb-1">Demo credentials:</p>
            <p className="text-xs text-gray-500">admin@silverbacking.com / admin123</p>
            <p className="text-xs text-gray-500">reviewer@silverbacking.com / reviewer123</p>
          </div>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          SilverBacking Trust B.V. &mdash; Compliance Management
        </p>
      </div>
    </div>
  );
}
