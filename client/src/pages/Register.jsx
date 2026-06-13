import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) return setError('Please accept the risk disclosure');
    setError('');
    setLoading(true);
    try {
      await register(form.email, form.password, form.name, 'follower');
      navigate('/traders');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl mb-4 block">📈</span>
          <h1 className="text-3xl font-bold text-white mb-2">Join Dynasty Signals</h1>
          <p className="text-gray-500">Get access to real-time trade signals from Carlos Ventura</p>
        </div>

        {/* What you get */}
        <div className="card mb-6 bg-brand-500/5 border-brand-500/20">
          <p className="text-xs text-brand-400 font-semibold uppercase tracking-wider mb-3">What You Get</p>
          <ul className="space-y-2">
            {[
              'Real-time BUY/SELL/HOLD signals',
              'Entry price, target & stop loss on every trade',
              'Full trade history & performance stats',
              'Direct access to the #1 ranked signal provider',
            ].map(item => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-brand-500">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Full Name</label>
            <input className="input" type="text" placeholder="John Smith" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
            <input className="input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} required minLength={8} />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-0.5 accent-green-500" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
            <span className="text-xs text-gray-500 leading-relaxed">
              I understand that Dynasty Signals provides signals for <strong className="text-gray-400">informational purposes only</strong>, is not financial advice, and that trading involves substantial risk of loss. I accept the{' '}
              <Link to="/terms" target="_blank" className="text-brand-400 underline">Terms of Service</Link> and{' '}
              <Link to="/risk" target="_blank" className="text-brand-400 underline">Risk Disclosure</Link>.
            </span>
          </label>

          <button type="submit" className="btn-primary w-full" disabled={loading || !agreed}>
            {loading ? 'Creating account...' : 'Create Free Account'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
