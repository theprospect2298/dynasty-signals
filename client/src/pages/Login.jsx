import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'trader' ? '/dashboard' : '/feed');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (email) => {
    setForm({ email, password: 'password123' });
    setLoading(true);
    try {
      const user = await login(email, 'password123');
      navigate(user.role === 'trader' ? '/dashboard' : '/feed');
    } catch {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-500">Sign in to your Dynasty Signals account</p>
        </div>

        {/* Demo accounts */}
        <div className="card mb-6">
          <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">Quick Demo Logins</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => demoLogin('alex@demo.com')} className="text-xs bg-dark-700 hover:bg-dark-600 text-brand-400 px-3 py-2 rounded-lg border border-gray-700 transition-colors text-left">
              <span className="block font-semibold">Alex Rivera</span>
              <span className="text-gray-500">Trader (Top Performer)</span>
            </button>
            <button onClick={() => demoLogin('follower@demo.com')} className="text-xs bg-dark-700 hover:bg-dark-600 text-blue-400 px-3 py-2 rounded-lg border border-gray-700 transition-colors text-left">
              <span className="block font-semibold">Demo User</span>
              <span className="text-gray-500">Follower Account</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-gray-500">
            No account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300">Create one free</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
