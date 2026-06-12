import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SignalCard from '../components/SignalCard';

export default function TraderProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [preview, setPreview] = useState([]);
  const [subStatus, setSubStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [traderRes, previewRes] = await Promise.all([
          axios.get(`/api/traders/${id}`),
          axios.get(`/api/signals/preview/${id}`)
        ]);
        setData(traderRes.data);
        setPreview(previewRes.data);

        if (user) {
          const subRes = await axios.get(`/api/subscriptions/check/${id}`);
          setSubStatus(subRes.data);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [id, user]);

  const handleSubscribe = async () => {
    if (!user) return navigate('/register');
    setSubLoading(true);
    try {
      await axios.post('/api/subscriptions', { trader_id: id });
      setSubStatus({ subscribed: true });
      setMsg('Subscribed! You can now view their live signals.');
      setData(d => ({ ...d, trader: { ...d.trader, followers_count: d.trader.followers_count + 1 } }));
    } catch (e) {
      setMsg(e.response?.data?.error || 'Failed to subscribe');
    } finally { setSubLoading(false); }
  };

  const handleUnsubscribe = async () => {
    setSubLoading(true);
    try {
      await axios.delete(`/api/subscriptions/${id}`);
      setSubStatus({ subscribed: false });
      setMsg('Unsubscribed successfully.');
    } catch { setMsg('Failed to unsubscribe'); }
    finally { setSubLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-20 text-gray-500">Trader not found</div>;

  const { trader, recentSignals } = data;
  const isSubscribed = subStatus?.subscribed;
  const isOwnProfile = user?.role === 'trader';

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-black text-3xl shrink-0">
            {trader.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{trader.name}</h1>
              {trader.official ? (
                <>
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/40 font-bold">👑 Official Dynasty Signals</span>
                  <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded border border-brand-500/30">✓ Verified</span>
                </>
              ) : trader.verified ? (
                <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded border border-brand-500/30">✓ Verified Provider</span>
              ) : null}
            </div>
            <p className="text-gray-400 mb-3">{trader.bio}</p>
            <p className="text-sm text-gray-500 italic">"{trader.strategy}"</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-3xl font-black text-green-400 mb-0.5">+{trader.total_return?.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mb-4">Cumulative Return</p>

            {msg && <p className="text-xs text-brand-400 mb-2">{msg}</p>}

            {!isOwnProfile && (
              isSubscribed ? (
                <div className="space-y-2">
                  <Link to={`/signals/${id}`} className="btn-primary block text-center text-sm">
                    View Live Signals →
                  </Link>
                  <button onClick={handleUnsubscribe} disabled={subLoading} className="text-xs text-gray-500 hover:text-red-400 transition-colors block w-full text-center">
                    Cancel subscription
                  </button>
                </div>
              ) : (
                <button onClick={handleSubscribe} disabled={subLoading} className="btn-primary text-sm">
                  {subLoading ? 'Processing...' : `Subscribe — $${trader.subscription_price}/mo`}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Win Rate', value: `${trader.win_rate}%`, color: 'text-green-400' },
          { label: 'Total Trades', value: trader.trade_count, color: 'text-white' },
          { label: 'Followers', value: trader.followers_count, color: 'text-white' },
          { label: 'Price', value: `$${trader.subscription_price}/mo`, color: 'text-brand-400' },
        ].map(s => (
          <div key={s.label} className="stat-card text-center">
            <p className={`text-2xl font-black ${s.color} mb-1`}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Signal History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Recent Trade History</h2>
          {!isSubscribed && <span className="text-xs text-gray-500">Showing closed trades only — subscribe for live signals</span>}
        </div>

        {isSubscribed ? (
          recentSignals.length > 0 ? (
            <div className="space-y-3">
              {recentSignals.map(s => <SignalCard key={s.id} signal={s} />)}
            </div>
          ) : <p className="text-gray-500 text-center py-10">No signals yet</p>
        ) : (
          preview.length > 0 ? (
            <div className="space-y-3">
              {preview.map(s => (
                <div key={s.id} className="card border-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">{s.asset}</span>
                    <span className={s.action === 'BUY' ? 'badge-buy' : s.action === 'SELL' ? 'badge-sell' : 'badge-hold'}>{s.action}</span>
                    {s.result === 'win' && <span className="badge-win">✓ +{s.profit_loss_pct?.toFixed(1)}%</span>}
                    {s.result === 'loss' && <span className="badge-loss">✗ {s.profit_loss_pct?.toFixed(1)}%</span>}
                    <span className="text-xs text-gray-600 ml-auto">{s.timeframe}</span>
                  </div>
                  <div className="mt-3 p-3 bg-dark-700/50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">Subscribe to see entry/exit details and live signals</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 text-center py-10">No trade history yet</p>
        )}
      </div>
    </div>
  );
}
