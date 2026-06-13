import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function BrowseFollowers() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/api/followers')
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  const followers = data?.followers || [];
  const filtered = followers.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));
  const officialId = data?.officialTraderId;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Browse Signal Followers</h1>
        <p className="text-gray-500">The Dynasty community — traders following Carlos Ventura's live signals.</p>
      </div>

      {/* Community stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="stat-card text-center">
          <p className="text-3xl font-black text-brand-400 mb-1">{data?.total ?? '—'}</p>
          <p className="text-xs text-gray-500">Total Members</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-3xl font-black text-green-400 mb-1">{data?.subscribed ?? '—'}</p>
          <p className="text-xs text-gray-500">Active Subscribers</p>
        </div>
        <div className="stat-card text-center flex flex-col items-center justify-center">
          {user ? (
            officialId && <Link to={`/traders/${officialId}`} className="btn-primary text-sm py-2 px-4">Subscribe to Signals →</Link>
          ) : (
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Join the Community →</Link>
          )}
        </div>
      </div>

      <input
        className="input mb-6"
        placeholder="Search members…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse flex items-center gap-3">
              <div className="w-11 h-11 bg-dark-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-dark-700 rounded w-2/3" />
                <div className="h-3 bg-dark-700 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">👥</p>
          <p className="text-white font-semibold mb-2">No members yet</p>
          <p className="text-gray-500 text-sm mb-6">Be the first to join the Dynasty community.</p>
          <Link to="/register" className="btn-primary">Join Now</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(f => (
            <div key={f.id} className="card flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-500 to-cyan-700 flex items-center justify-center text-white font-bold shrink-0">
                {f.initial}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">{f.name}</p>
                <p className="text-xs text-gray-500">
                  Member since {f.joined}
                  {f.following > 0 && <span className="ml-2 text-brand-400">● Subscribed</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-600 mt-8 text-center">
        For member privacy, only first names and last initials are shown. Email addresses are never displayed.
      </p>
    </div>
  );
}
