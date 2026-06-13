import { useState, useEffect } from 'react';
import axios from 'axios';

const STATUS_STYLE = {
  pending: 'bg-yellow-900/40 text-yellow-400 border-yellow-700/50',
  approved: 'bg-green-900/40 text-green-400 border-green-700/50',
  rejected: 'bg-red-900/40 text-red-400 border-red-700/50',
};

const FIELD_LABELS = [
  ['markets', 'Markets'], ['experience_years', 'Experience'], ['win_rate', 'Win rate'],
  ['avg_expectancy', 'Avg expectancy'], ['avg_rr', 'Avg R:R'], ['max_drawdown', 'Max drawdown'],
  ['risk_per_trade', 'Risk/trade'], ['track_record_url', 'Track record'],
];

export default function AdminApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    axios.get('/api/applications')
      .then(r => setApps(r.data))
      .catch(err => setError(err.response?.status === 403 ? 'Owner access only.' : 'Failed to load applications'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const setStatus = async (id, status) => {
    await axios.put(`/api/applications/${id}/status`, { status });
    setApps(a => a.map(x => x.id === id ? { ...x, status } : x));
  };

  if (loading) return <div className="flex justify-center py-24"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (error) return <div className="max-w-2xl mx-auto px-4 py-24 text-center text-gray-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-1">Provider Applications</h1>
      <p className="text-sm text-gray-500 mb-8">{apps.length} total · {apps.filter(a => a.status === 'pending').length} pending review</p>

      {apps.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">No applications yet.</div>
      ) : (
        <div className="space-y-4">
          {apps.map(a => (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-bold text-white text-lg">{a.name}</p>
                  <a href={`mailto:${a.email}`} className="text-sm text-brand-400 hover:text-brand-300">{a.email}</a>
                  <p className="text-xs text-gray-600 mt-0.5">{(a.created_at || '').slice(0, 16).replace('T', ' ')}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLE[a.status] || STATUS_STYLE.pending}`}>{a.status}</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
                {FIELD_LABELS.map(([k, label]) => a[k] ? (
                  <div key={k} className="flex gap-2 text-sm">
                    <span className="text-gray-500 shrink-0">{label}:</span>
                    {k === 'track_record_url'
                      ? <a href={a[k]} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline truncate">{a[k]}</a>
                      : <span className="text-gray-300">{a[k]}</span>}
                  </div>
                ) : null)}
              </div>

              {a.strategy && <p className="text-sm text-gray-400 mb-2"><span className="text-gray-500">Strategy:</span> {a.strategy}</p>}
              {a.why && <p className="text-sm text-gray-400 mb-3"><span className="text-gray-500">Why:</span> {a.why}</p>}

              {a.proof_urls.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {a.proof_urls.map((u, i) => (
                    <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="text-xs bg-dark-700 border border-gray-700 rounded px-2.5 py-1 text-brand-400 hover:border-brand-500/50">📄 Proof {i + 1}</a>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-gray-800">
                <button onClick={() => setStatus(a.id, 'approved')} className="text-xs btn-primary py-1.5 px-3">Approve</button>
                <button onClick={() => setStatus(a.id, 'rejected')} className="text-xs btn-danger py-1.5 px-3">Reject</button>
                <button onClick={() => setStatus(a.id, 'pending')} className="text-xs btn-secondary py-1.5 px-3">Mark Pending</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
