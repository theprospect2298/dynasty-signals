import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function TraderCard({ trader }) {
  const returnColor = trader.total_return >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <Link to={`/traders/${trader.id}`} className="card hover:border-gray-600 transition-all hover:-translate-y-0.5 block">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {trader.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white">{trader.name}</h3>
              {trader.official ? (
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/40 font-bold">👑 Official</span>
              ) : trader.verified ? (
                <span className="text-xs bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded border border-brand-500/30">✓ Verified</span>
              ) : null}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{trader.strategy || 'No strategy description yet'}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-xl font-black ${returnColor}`}>+{trader.total_return.toFixed(1)}%</p>
          <p className="text-xs text-gray-500">Total Return</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="stat-card text-center py-2">
          <p className="text-sm font-bold text-white">{trader.win_rate}%</p>
          <p className="text-xs text-gray-500">Win Rate</p>
        </div>
        <div className="stat-card text-center py-2">
          <p className="text-sm font-bold text-white">{trader.trade_count}</p>
          <p className="text-xs text-gray-500">Trades</p>
        </div>
        <div className="stat-card text-center py-2">
          <p className="text-sm font-bold text-white">{trader.followers_count}</p>
          <p className="text-xs text-gray-500">Followers</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400 line-clamp-1 flex-1 mr-4">{trader.bio || ''}</p>
        <span className="text-brand-500 font-bold text-sm shrink-0">${trader.subscription_price}/mo →</span>
      </div>
    </Link>
  );
}

export default function BrowseTraders() {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('return');
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/api/traders').then(r => setTraders(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = traders
    .filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.strategy || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'return') return b.total_return - a.total_return;
      if (sort === 'winrate') return b.win_rate - a.win_rate;
      if (sort === 'followers') return b.followers_count - a.followers_count;
      if (sort === 'price_asc') return a.subscription_price - b.subscription_price;
      return 0;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Browse Signal Providers</h1>
        <p className="text-gray-500">Subscribe to verified traders and receive their signals in real-time.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          className="input flex-1"
          placeholder="Search traders by name or strategy..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="input sm:w-48"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="return">Sort: Total Return</option>
          <option value="winrate">Sort: Win Rate</option>
          <option value="followers">Sort: Most Followed</option>
          <option value="price_asc">Sort: Price (Low-High)</option>
        </select>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 bg-dark-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-dark-700 rounded w-3/4" />
                  <div className="h-3 bg-dark-700 rounded w-1/2" />
                </div>
              </div>
              <div className="h-16 bg-dark-700 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No traders found</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(t => <TraderCard key={t.id} trader={t} />)}
        </div>
      )}
    </div>
  );
}
