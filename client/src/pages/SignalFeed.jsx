import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import SignalCard from '../components/SignalCard';

export default function SignalFeed() {
  const { traderId } = useParams();
  const [signals, setSignals] = useState([]);
  const [trader, setTrader] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sigRes, traderRes] = await Promise.all([
          axios.get(`/api/signals/feed?trader_id=${traderId}`),
          axios.get(`/api/traders/${traderId}`)
        ]);
        setSignals(sigRes.data);
        setTrader(traderRes.data.trader);
      } catch (e) {
        setError(e.response?.data?.error || 'Failed to load signals');
      } finally { setLoading(false); }
    };
    fetchData();
  }, [traderId]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {trader && (
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-lg">
            {trader.name[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{trader.name}'s Signals</h1>
            <p className="text-sm text-gray-500">Win Rate: <span className="text-green-400">{trader.win_rate}%</span> · Return: <span className="text-green-400">+{trader.total_return?.toFixed(1)}%</span></p>
          </div>
          <Link to={`/traders/${traderId}`} className="ml-auto text-sm text-gray-500 hover:text-white transition-colors">View Profile →</Link>
        </div>
      )}

      {error ? (
        <div className="card text-center py-10">
          <p className="text-red-400 mb-4">{error}</p>
          <Link to="/subscribe" className="btn-secondary text-sm">Subscribe to Signals</Link>
        </div>
      ) : signals.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No signals published yet</div>
      ) : (
        <div className="space-y-4">
          {signals.map(s => <SignalCard key={s.id} signal={s} />)}
        </div>
      )}
    </div>
  );
}
