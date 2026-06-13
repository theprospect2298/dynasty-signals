import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const FIELDS = [
  { k: 'name', label: 'Full name', type: 'text', required: true, ph: 'Jane Trader' },
  { k: 'email', label: 'Email', type: 'email', required: true, ph: 'you@example.com' },
  { k: 'markets', label: 'Markets you trade', type: 'text', ph: 'Futures (MNQ/ES), crypto, FX…' },
  { k: 'experience_years', label: 'Years actively trading', type: 'text', ph: 'e.g. 5' },
  { k: 'win_rate', label: 'Win rate %', type: 'text', required: true, ph: 'e.g. 64%' },
  { k: 'avg_expectancy', label: 'Avg expectancy per trade %', type: 'text', required: true, ph: 'e.g. +0.8% per trade' },
  { k: 'avg_rr', label: 'Average reward : risk', type: 'text', ph: 'e.g. 1.8 : 1' },
  { k: 'max_drawdown', label: 'Max drawdown', type: 'text', ph: 'e.g. -12%' },
  { k: 'risk_per_trade', label: 'Risk per trade', type: 'text', ph: 'e.g. 1% of account' },
  { k: 'track_record_url', label: 'Verified track-record link', type: 'text', ph: 'Myfxbook / TradingView / FXBlue / broker statement URL' },
];

export default function ProviderApplication() {
  const empty = Object.fromEntries(FIELDS.map(f => [f.k, '']));
  const [form, setForm] = useState({ ...empty, strategy: '', why: '' });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach(f => fd.append('proof', f));
      await axios.post('/api/applications', fd);
      setDone(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed — please try again.');
    } finally { setLoading(false); }
  };

  if (done) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <span className="text-5xl mb-5 block">✅</span>
      <h1 className="text-2xl font-bold text-white mb-3">Application received</h1>
      <p className="text-gray-400 mb-8 leading-relaxed">
        Thanks for applying to become a Dynasty Signals provider. We review every application personally and verify your track record before approving. If it's a fit, we'll reach out by email.
      </p>
      <Link to="/" className="btn-primary inline-block">Back to Home</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-3 block">Apply to Publish</span>
        <h1 className="text-3xl font-black text-white mb-3">Become a Signal Provider</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Dynasty Signals is invite-only. To keep quality high, every provider is vetted on a verified track record before they can publish to subscribers. Tell us about your edge.
        </p>
      </div>

      <form onSubmit={submit} className="card space-y-4">
        {error && <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}

        <div className="grid sm:grid-cols-2 gap-4">
          {FIELDS.map(f => (
            <div key={f.k} className={f.k === 'track_record_url' ? 'sm:col-span-2' : ''}>
              <label className="block text-sm text-gray-400 mb-1.5">
                {f.label}{f.required && <span className="text-brand-400"> *</span>}
              </label>
              <input
                className="input" type={f.type} placeholder={f.ph}
                value={form[f.k]} onChange={e => set(f.k, e.target.value)} required={!!f.required}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Strategy overview</label>
          <textarea className="input min-h-[80px] resize-y" placeholder="How do you find trades? What's your style and edge?" value={form.strategy} onChange={e => set('strategy', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Why do you want to publish on Dynasty?</label>
          <textarea className="input min-h-[70px] resize-y" placeholder="Tell us a bit about you and your goals." value={form.why} onChange={e => set('why', e.target.value)} />
        </div>

        {/* Proof upload */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Proof — last 3 months of trades</label>
          <input ref={fileRef} type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,text/csv" className="hidden"
            onChange={e => setFiles(Array.from(e.target.files || []).slice(0, 6))} />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-700 hover:border-brand-500/60 rounded-xl p-4 text-center transition-colors">
            <span className="text-xl block mb-1">📎</span>
            <span className="text-sm text-gray-300 block">Upload broker statements or trade screenshots</span>
            <span className="text-xs text-gray-500">PNG, JPG, PDF or CSV · up to 6 files · 15MB each</span>
          </button>
          {files.length > 0 && (
            <ul className="mt-2 space-y-1">
              {files.map((f, i) => (
                <li key={i} className="text-xs text-brand-400 flex items-center gap-2">
                  <span>📄</span> {f.name}
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-gray-600 mt-2">A verified link (Myfxbook, TradingView, FXBlue) or uploaded proof is required.</p>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit Application'}
        </button>
        <p className="text-xs text-gray-600 text-center leading-relaxed">
          By applying you confirm the information and track record are genuinely yours. Falsified results are grounds for permanent rejection.
        </p>
      </form>
    </div>
  );
}
