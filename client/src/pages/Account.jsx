import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// ── /settings — change password ─────────────────────────────────────────────
export function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [msg, setMsg] = useState(null); // { ok, text }
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) return setMsg({ ok: false, text: 'New passwords do not match' });
    setLoading(true); setMsg(null);
    try {
      await axios.post('/api/auth/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setMsg({ ok: true, text: 'Password updated successfully.' });
      setForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.error || 'Failed to update password' });
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-white mb-1">Account Settings</h1>
      <p className="text-sm text-gray-500 mb-8">{user?.email}</p>

      <form onSubmit={submit} className="card space-y-4">
        <h2 className="font-bold text-white">Change Password</h2>
        {msg && (
          <div className={`rounded-lg px-4 py-3 text-sm border ${msg.ok ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-red-900/30 border-red-800 text-red-400'}`}>
            {msg.text}
          </div>
        )}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Current password</label>
          <input className="input" type="password" value={form.current_password} onChange={e => set('current_password', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">New password</label>
          <input className="input" type="password" minLength={8} placeholder="Min 8 characters" value={form.new_password} onChange={e => set('new_password', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Confirm new password</label>
          <input className="input" type="password" minLength={8} value={form.confirm} onChange={e => set('confirm', e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Saving…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

// ── /forgot-password ─────────────────────────────────────────────────────────
export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email });
      setMsg({ ok: true, text: data.message || 'If that email is registered, a reset link is on its way.' });
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.error || 'Something went wrong — try again.' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reset your password</h1>
          <p className="text-gray-500">Enter your account email and we'll send a reset link.</p>
        </div>
        <form onSubmit={submit} className="card space-y-4">
          {msg && (
            <div className={`rounded-lg px-4 py-3 text-sm border ${msg.ok ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-red-900/30 border-red-800 text-red-400'}`}>
              {msg.text}
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
          <p className="text-center text-sm text-gray-500">
            Remembered it? <Link to="/login" className="text-brand-400 hover:text-brand-300">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

// ── /reset-password?token=... ────────────────────────────────────────────────
export function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setMsg({ ok: false, text: 'Passwords do not match' });
    setLoading(true); setMsg(null);
    try {
      await axios.post('/api/auth/reset-password', { token, password: form.password });
      setMsg({ ok: true, text: 'Password reset! Redirecting to sign in…' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.error || 'Reset failed — the link may have expired.' });
    } finally { setLoading(false); }
  };

  if (!token) return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <p className="text-gray-400 mb-4">This reset link is missing its token.</p>
      <Link to="/forgot-password" className="btn-primary inline-block">Request a New Link</Link>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Choose a new password</h1>
        </div>
        <form onSubmit={submit} className="card space-y-4">
          {msg && (
            <div className={`rounded-lg px-4 py-3 text-sm border ${msg.ok ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-red-900/30 border-red-800 text-red-400'}`}>
              {msg.text}
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">New password</label>
            <input className="input" type="password" minLength={8} placeholder="Min 8 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Confirm password</label>
            <input className="input" type="password" minLength={8} value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
