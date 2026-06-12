import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SignalCard from '../components/SignalCard';

function PublishSignalModal({ onClose, onPublished }) {
  const [form, setForm] = useState({ asset: '', action: 'BUY', entry_price: '', target_price: '', stop_loss: '', timeframe: 'Swing', rationale: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/signals', form);
      onPublished(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to publish signal');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-gray-700 rounded-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">Publish New Signal</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-2 text-red-400 text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Asset *</label>
              <input className="input" placeholder="AAPL, BTC/USD..." value={form.asset} onChange={e => set('asset', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Action *</label>
              <select className="input" value={form.action} onChange={e => set('action', e.target.value)}>
                <option>BUY</option>
                <option>SELL</option>
                <option>HOLD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Entry Price</label>
              <input className="input" type="number" step="0.01" placeholder="0.00" value={form.entry_price} onChange={e => set('entry_price', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Target</label>
              <input className="input" type="number" step="0.01" placeholder="0.00" value={form.target_price} onChange={e => set('target_price', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Stop Loss</label>
              <input className="input" type="number" step="0.01" placeholder="0.00" value={form.stop_loss} onChange={e => set('stop_loss', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Timeframe</label>
            <select className="input" value={form.timeframe} onChange={e => set('timeframe', e.target.value)}>
              <option>Scalp</option>
              <option>Day</option>
              <option>Swing</option>
              <option>Position</option>
              <option>Long-Term</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Rationale</label>
            <textarea className="input min-h-[80px] resize-y" placeholder="Explain your thesis, key levels, catalysts..." value={form.rationale} onChange={e => set('rationale', e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Signal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CloseSignalModal({ signal, onClose, onClosed }) {
  const [form, setForm] = useState({ result: 'win', profit_loss_pct: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`/api/signals/${signal.id}/close`, form);
      onClosed(signal.id);
      onClose();
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-gray-700 rounded-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-white mb-4">Close Signal: {signal.asset}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Outcome</label>
            <select className="input" value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))}>
              <option value="win">Win ✓</option>
              <option value="loss">Loss ✗</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">P/L % (e.g. 12.5 or -4.2)</label>
            <input className="input" type="number" step="0.1" placeholder="8.5" value={form.profit_loss_pct} onChange={e => setForm(f => ({ ...f, profit_loss_pct: e.target.value }))} required />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Closing...' : 'Close Signal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TraderDashboard() {
  const { user, refreshProfile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('signals');
  const [showPublish, setShowPublish] = useState(false);
  const [closingSignal, setClosingSignal] = useState(null);
  const [profileForm, setProfileForm] = useState({ bio: '', strategy: '', subscription_price: '9.99' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    axios.get('/api/traders/me/stats').then(r => {
      setData(r.data);
      setProfileForm({
        bio: r.data.profile.bio || '',
        strategy: r.data.profile.strategy || '',
        subscription_price: String(r.data.profile.subscription_price || '9.99'),
      });
    }).finally(() => setLoading(false));
  }, []);

  const handlePublished = (signal) => {
    setData(d => ({ ...d, signals: [signal, ...d.signals] }));
  };

  const handleClosed = (signalId) => {
    setData(d => ({
      ...d,
      signals: d.signals.map(s => s.id === signalId ? { ...s, status: 'closed' } : s)
    }));
    axios.get('/api/traders/me/stats').then(r => setData(r.data));
  };

  const handleCancel = async (id) => {
    await axios.put(`/api/signals/${id}/cancel`);
    setData(d => ({ ...d, signals: d.signals.map(s => s.id === id ? { ...s, status: 'cancelled' } : s) }));
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await axios.put('/api/traders/profile', profileForm);
      setSaveMsg('Profile saved!');
      refreshProfile();
    } catch { setSaveMsg('Save failed'); }
    finally { setSaving(false); setTimeout(() => setSaveMsg(''), 3000); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  const { profile, signals, subscribers, stats } = data;
  const activeSignals = signals.filter(s => s.status === 'active');
  const monthlyRevenue = subscribers.length * profile.subscription_price;
  const traderCut = monthlyRevenue * 0.85;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {showPublish && <PublishSignalModal onClose={() => setShowPublish(false)} onPublished={handlePublished} />}
      {closingSignal && <CloseSignalModal signal={closingSignal} onClose={() => setClosingSignal(null)} onClosed={handleClosed} />}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Trader Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user.name}</p>
        </div>
        <button onClick={() => setShowPublish(true)} className="btn-primary">
          + Publish Signal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Return', value: `+${profile.total_return?.toFixed(1)}%`, color: 'text-green-400' },
          { label: 'Win Rate', value: `${stats.winRate}%`, color: 'text-white' },
          { label: 'Subscribers', value: stats.activeSubs, color: 'text-white' },
          { label: 'Your Revenue', value: `$${traderCut.toFixed(2)}/mo`, color: 'text-brand-400' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className={`text-2xl font-black ${s.color} mb-1`}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue breakdown */}
      <div className="card mb-8 bg-dark-700/50">
        <p className="text-sm font-semibold text-white mb-2">Revenue Breakdown (This Month)</p>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">{subscribers.length} subs × ${profile.subscription_price}/mo = <strong className="text-white">${monthlyRevenue.toFixed(2)}</strong></span>
          <span className="text-gray-600">→</span>
          <span className="text-gray-400">Platform (15%) = <strong className="text-red-400">-${(monthlyRevenue * 0.15).toFixed(2)}</strong></span>
          <span className="text-gray-600">→</span>
          <span className="text-gray-400">Your payout (85%) = <strong className="text-green-400">${traderCut.toFixed(2)}</strong></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-dark-800 border border-gray-800 rounded-lg p-1 w-fit">
        {['signals', 'subscribers', 'profile'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-dark-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            {t === 'signals' ? `📡 Signals (${signals.length})` : t === 'subscribers' ? `👥 Subscribers (${subscribers.length})` : '⚙️ Profile'}
          </button>
        ))}
      </div>

      {tab === 'signals' && (
        <div>
          {activeSignals.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Active Signals</h3>
              <div className="space-y-3">
                {activeSignals.map(s => (
                  <div key={s.id}>
                    <SignalCard signal={s} />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => setClosingSignal(s)} className="text-xs btn-secondary py-1.5 px-3">Close Signal</button>
                      <button onClick={() => handleCancel(s.id)} className="text-xs text-gray-500 hover:text-red-400 transition-colors px-3">Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Signal History</h3>
          {signals.filter(s => s.status !== 'active').length === 0 ? (
            <p className="text-gray-500 text-center py-10">No closed signals yet</p>
          ) : (
            <div className="space-y-3">
              {signals.filter(s => s.status !== 'active').map(s => <SignalCard key={s.id} signal={s} />)}
            </div>
          )}
        </div>
      )}

      {tab === 'subscribers' && (
        subscribers.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No subscribers yet. Keep publishing quality signals!</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {subscribers.map(sub => (
              <div key={sub.follower_id} className="card flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dark-600 flex items-center justify-center text-white font-bold shrink-0">
                  {sub.follower_name[0]}
                </div>
                <div>
                  <p className="font-medium text-white">{sub.follower_name}</p>
                  <p className="text-xs text-gray-500">{sub.follower_email} · ${sub.price}/mo</p>
                </div>
                <span className="ml-auto text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">Active</span>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'profile' && (
        <div className="card max-w-2xl space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Bio</label>
            <textarea className="input min-h-[80px] resize-y" placeholder="Tell followers about your trading background..." value={profileForm.bio} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Trading Strategy</label>
            <textarea className="input min-h-[80px] resize-y" placeholder="Describe your strategy, risk management approach..." value={profileForm.strategy} onChange={e => setProfileForm(f => ({ ...f, strategy: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Subscription Price</label>
            <select className="input" value={profileForm.subscription_price} onChange={e => setProfileForm(f => ({ ...f, subscription_price: e.target.value }))}>
              <option value="9.99">$9.99/month — Basic</option>
              <option value="19.99">$19.99/month — Pro</option>
              <option value="29.99">$29.99/month — Premium</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={saveProfile} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            {saveMsg && <span className="text-sm text-brand-400">{saveMsg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
