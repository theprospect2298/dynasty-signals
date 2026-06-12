import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SignalCard from '../components/SignalCard';

export default function FollowerDashboard() {
  const { user } = useAuth();
  const [feed, setFeed] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('feed');

  useEffect(() => {
    Promise.all([
      axios.get('/api/signals/feed'),
      axios.get('/api/subscriptions/mine'),
    ]).then(([feedRes, subRes]) => {
      setFeed(feedRes.data);
      setSubs(subRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const activeSubs = subs.filter(s => s.status === 'active');
  const monthlySpend = activeSubs.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Your signal feed from {activeSubs.length} active subscriptions</p>
        </div>
        <Link to="/traders" className="btn-primary text-sm">+ Add Trader</Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <p className="text-2xl font-black text-white">{activeSubs.length}</p>
          <p className="text-xs text-gray-500">Active Subscriptions</p>
        </div>
        <div className="stat-card">
          <p className="text-2xl font-black text-brand-400">${monthlySpend.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Monthly Spend</p>
        </div>
        <div className="stat-card">
          <p className="text-2xl font-black text-white">{feed.filter(s => s.status === 'active').length}</p>
          <p className="text-xs text-gray-500">Live Signals</p>
        </div>
        <div className="stat-card">
          <p className="text-2xl font-black text-green-400">{feed.filter(s => s.result === 'win').length}</p>
          <p className="text-xs text-gray-500">Wins (All Time)</p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-dark-800 border border-gray-800 rounded-lg p-1 w-fit">
        {['feed', 'subscriptions'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-dark-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            {t === 'feed' ? '📡 Signal Feed' : '📋 My Subscriptions'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-32 animate-pulse bg-dark-700" />)}
        </div>
      ) : tab === 'feed' ? (
        activeSubs.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-4xl mb-4">📡</p>
            <p className="text-white font-semibold mb-2">No signals yet</p>
            <p className="text-gray-500 text-sm mb-6">Subscribe to traders to start receiving their signals here.</p>
            <Link to="/traders" className="btn-primary">Browse Traders</Link>
          </div>
        ) : feed.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Your subscribed traders haven't published any signals yet.</div>
        ) : (
          <div className="space-y-4">
            {feed.map(s => <SignalCard key={s.id} signal={s} showTrader />)}
          </div>
        )
      ) : (
        activeSubs.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-white font-semibold mb-2">No active subscriptions</p>
            <Link to="/traders" className="btn-primary mt-4">Browse Traders</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {subs.map(sub => (
              <div key={sub.id} className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold shrink-0">
                    {sub.trader_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{sub.trader_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${sub.status === 'active' ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                        {sub.status}
                      </span>
                      <span className="text-xs text-gray-500">${sub.price}/mo</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="stat-card py-2 text-center">
                    <p className="text-sm font-bold text-green-400">{sub.win_rate}%</p>
                    <p className="text-xs text-gray-500">Win Rate</p>
                  </div>
                  <div className="stat-card py-2 text-center">
                    <p className="text-sm font-bold text-white">+{sub.total_return?.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">Return</p>
                  </div>
                </div>
                <Link to={`/signals/${sub.trader_id}`} className="btn-secondary w-full text-center text-sm block">
                  View Signals
                </Link>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
