import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SignalCard from '../components/SignalCard';
import StatTile from '../components/StatTile';

function PublishSignalModal({ onClose, onPublished }) {
  const [form, setForm] = useState({ asset: '', action: 'BUY', entry_price: '', target_price: '', stop_loss: '', timeframe: 'Swing', rationale: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseNote, setParseNote] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const fileRef = useRef(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = async (file) => {
    if (!file) return;
    setError(''); setParseNote(''); setParsing(true);
    const fd = new FormData();
    fd.append('screenshot', file);
    try {
      const { data } = await axios.post('/api/signals/parse-screenshot', fd);
      setForm(f => ({
        ...f,
        asset: data.asset || f.asset,
        action: ['BUY', 'SELL'].includes(data.action) ? data.action : f.action,
        entry_price: data.entry_price ?? f.entry_price,
        target_price: data.target_price ?? f.target_price,
        stop_loss: data.stop_loss ?? f.stop_loss,
      }));
      setScreenshotUrl(data.screenshot_url || '');
      setParseNote(`🤖 ${data.confidence === 'high' ? 'Read with high confidence' : data.confidence === 'medium' ? 'Read — double-check the levels' : 'Low confidence — verify everything'}. ${data.notes || ''}`);
    } catch (err) {
      setScreenshotUrl(err.response?.data?.screenshot_url || '');
      setError(err.response?.data?.error || 'Failed to read the screenshot');
    } finally {
      setParsing(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/signals', { ...form, screenshot_url: screenshotUrl || undefined });
      onPublished(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to publish signal');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-dark-800 border border-gray-700 rounded-xl w-full max-w-lg my-8">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">Publish New Signal</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-2 text-red-400 text-sm">{error}</div>}

          {/* Chart screenshot → AI autofill */}
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden"
            onChange={e => handleFile(e.target.files?.[0])} />
          {!screenshotUrl ? (
            <button type="button" disabled={parsing}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
              className="w-full border-2 border-dashed border-gray-700 hover:border-brand-500/60 rounded-xl p-5 text-center transition-colors group">
              {parsing ? (
                <span className="flex items-center justify-center gap-3 text-brand-400 text-sm font-medium">
                  <span className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                  Reading chart with AI…
                </span>
              ) : (
                <>
                  <span className="text-2xl block mb-1.5">📊</span>
                  <span className="text-sm font-semibold text-gray-300 group-hover:text-brand-400 transition-colors block">Upload chart screenshot</span>
                  <span className="text-xs text-gray-500">AI fills in instrument, entry, stop &amp; target automatically</span>
                </>
              )}
            </button>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-gray-700">
              <img src={screenshotUrl} alt="Chart screenshot" className="w-full max-h-44 object-cover object-top" />
              <button type="button" onClick={() => { setScreenshotUrl(''); setParseNote(''); }}
                aria-label="Remove screenshot"
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-gray-300 hover:text-white hover:bg-black text-sm">
                ✕
              </button>
            </div>
          )}
          {parseNote && <p className="text-xs text-brand-400 leading-relaxed -mt-1">{parseNote}</p>}

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

      {/* Holographic header */}
      <div className="relative mb-8 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="absolute inset-0 holo-grid opacity-60" />
        <div className="absolute -top-12 -right-12 w-52 h-52 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-400 via-cyan-400 to-transparent" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
          <div>
            <p className="text-[11px] font-mono text-brand-400 tracking-[0.3em] uppercase mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 live-dot" /> Live Control Center
            </p>
            <h1 className="text-2xl font-black text-white">Trader Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user.name}</p>
          </div>
          <button onClick={() => setShowPublish(true)} className="btn-primary shadow-[0_0_24px_rgba(45,212,191,0.35)] hover:shadow-[0_0_34px_rgba(45,212,191,0.5)] transition-shadow self-start sm:self-auto">
            + Publish Signal
          </button>
        </div>
      </div>

      {/* 3D stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8" style={{ perspective: '1000px' }}>
        <StatTile label="Total Return" value={profile.total_return || 0} format={v => `+${v.toFixed(1)}%`} color="text-green-400" glow="34,197,94" icon="📈" />
        <StatTile label="Win Rate" value={stats.winRate || 0} format={v => `${Math.round(v)}%`} color="text-white" glow="45,212,191" icon="🎯" />
        <StatTile label="Subscribers" value={stats.activeSubs || 0} format={v => `${Math.round(v)}`} color="text-white" glow="56,189,248" icon="👥" />
        <StatTile label="Your Revenue" value={traderCut || 0} format={v => `$${v.toFixed(2)}/mo`} color="text-brand-400" glow="45,212,191" icon="💰" />
      </div>

      {/* Revenue breakdown */}
      <div className="relative card mb-8 bg-dark-700/50 border-brand-500/20 glow-border overflow-hidden">
        <div className="dash-scan" />
        <div className="relative">
          <p className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <span className="font-mono text-xs text-brand-400">▸</span> Revenue Breakdown · This Month
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="text-gray-400">{subscribers.length} subs × ${profile.subscription_price}/mo = <strong className="text-white">${monthlyRevenue.toFixed(2)}</strong></span>
            <span className="text-gray-600">→</span>
            <span className="text-gray-400">Platform (15%) = <strong className="text-red-400">-${(monthlyRevenue * 0.15).toFixed(2)}</strong></span>
            <span className="text-gray-600">→</span>
            <span className="text-gray-400">Your payout (85%) = <strong className="text-green-400">${traderCut.toFixed(2)}</strong></span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex gap-1 mb-6 bg-dark-800/80 backdrop-blur border border-gray-800 rounded-xl p-1">
        {['signals', 'subscribers', 'profile'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? 'bg-gradient-to-b from-dark-600 to-dark-700 text-white border border-brand-500/30 shadow-[0_0_16px_rgba(45,212,191,0.18)]' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}>
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
