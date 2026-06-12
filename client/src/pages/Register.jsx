import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'follower' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    if (params.get('role') === 'trader') setForm(f => ({ ...f, role: 'trader' }));
  }, [params]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) return setError('Please accept the risk disclosure');
    setError('');
    setLoading(true);
    try {
      const user = await register(form.email, form.password, form.name, form.role);
      navigate(user.role === 'trader' ? '/dashboard' : '/traders');
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
          <h1 className="text-3xl font-bold text-white mb-2">Join Dynasty Signals</h1>
          <p className="text-gray-500">Create your account and start today</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}

          {/* Role Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">I want to</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button"
                onClick={() => set('role', 'follower')}
                className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${form.role === 'follower' ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'bg-dark-700 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                📊 Follow Traders
              </button>
              <button type="button"
                onClick={() => set('role', 'trader')}
                className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${form.role === 'trader' ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'bg-dark-700 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                🎯 Publish Signals
              </button>
            </div>
          </div>

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
              <span className="text-brand-400 underline cursor-pointer">Terms of Service</span>.
            </span>
          </label>

          <button type="submit" className="btn-primary w-full" disabled={loading || !agreed}>
            {loading ? 'Creating account...' : 'Create Account'}
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
