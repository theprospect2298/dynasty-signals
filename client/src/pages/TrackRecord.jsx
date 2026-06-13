import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

const fmtPct = (n) => `${n > 0 ? '+' : ''}${n}%`;

function ChartTooltip({ active, payload, label, suffix = '%' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-0.5">{label}</p>
      <p className="font-bold text-brand-400">{payload[0].value}{suffix}</p>
    </div>
  );
}

export default function TrackRecord() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    axios.get('/api/track-record')
      .then(r => setData(r.data))
      .catch(() => setError(true));
  }, []);

  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <p className="text-gray-500">Track record is unavailable right now. Please try again later.</p>
    </div>
  );

  if (!data) return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { trader, stats, curve, monthly, trades } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-3 block">Full Transparency</span>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">{trader.name}'s Track Record</h1>
        <p className="text-gray-500 max-w-xl mx-auto">Every closed trade, logged publicly. No deleted losses, no cherry-picked wins.</p>
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Return', value: fmtPct(stats.totalReturn), color: stats.totalReturn >= 0 ? 'text-green-400' : 'text-red-400' },
          { label: 'Win Rate', value: `${stats.winRate}%`, color: 'text-white' },
          { label: 'Closed Trades', value: stats.totalTrades, color: 'text-white' },
          { label: 'Profit Factor', value: stats.profitFactor ?? '—', color: 'text-brand-400' },
          { label: 'Avg Win', value: fmtPct(stats.avgWin), color: 'text-green-400' },
          { label: 'Avg Loss', value: fmtPct(stats.avgLoss), color: 'text-red-400' },
          { label: 'Best Trade', value: fmtPct(stats.bestTrade), color: 'text-green-400' },
          { label: 'Current Win Streak', value: stats.winStreak, color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="stat-card text-center">
            <p className={`text-2xl font-black ${s.color} mb-1`}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {trades.length === 0 ? (
        <div className="card text-center py-16 mb-10">
          <p className="text-4xl mb-4">📈</p>
          <p className="text-white font-semibold mb-2">Trades will appear here as they close</p>
          <p className="text-gray-500 text-sm">The live track record is just getting started.</p>
        </div>
      ) : (
        <>
          {/* Equity curve */}
          <div className="card mb-8">
            <h2 className="font-bold text-white mb-1">Cumulative Return</h2>
            <p className="text-xs text-gray-500 mb-5">Sum of closed-trade P/L over time (%)</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={curve} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#15222e" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} minTickGap={40} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="equity" stroke="#2dd4bf" strokeWidth={2} fill="url(#equityFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly P/L */}
          <div className="card mb-8">
            <h2 className="font-bold text-white mb-1">Monthly P/L</h2>
            <p className="text-xs text-gray-500 mb-5">Net % per month</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#15222e" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(45,212,191,0.04)' }} />
                <Bar dataKey="pl" radius={[4, 4, 0, 0]}>
                  {monthly.map((m, i) => (
                    <Cell key={i} fill={m.pl >= 0 ? '#22c55e' : '#ef4444'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Trade log */}
          <div className="card mb-10 overflow-x-auto">
            <h2 className="font-bold text-white mb-4">Closed Trade Log</h2>
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Asset</th>
                  <th className="pb-3 pr-4">Side</th>
                  <th className="pb-3 pr-4">Entry</th>
                  <th className="pb-3 pr-4">Result</th>
                  <th className="pb-3 text-right">P/L</th>
                </tr>
              </thead>
              <tbody>
                {trades.map(t => (
                  <tr key={t.id} className="border-b border-gray-800/50">
                    <td className="py-3 pr-4 text-gray-400">{(t.closed_at || t.created_at || '').slice(0, 10)}</td>
                    <td className="py-3 pr-4 font-semibold text-white">{t.asset}</td>
                    <td className="py-3 pr-4">
                      <span className={t.action === 'BUY' ? 'badge-buy' : 'badge-sell'}>{t.action}</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{t.entry_price != null ? `$${Number(t.entry_price).toLocaleString()}` : '—'}</td>
                    <td className="py-3 pr-4">
                      {t.result === 'win'
                        ? <span className="badge-win">✓ Win</span>
                        : <span className="badge-loss">✗ Loss</span>}
                    </td>
                    <td className={`py-3 text-right font-bold ${(t.profit_loss_pct || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {t.profit_loss_pct != null ? fmtPct(t.profit_loss_pct) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* CTA */}
      <div className="text-center pb-6">
        <Link to="/register" className="btn-primary px-10 py-3.5 inline-block shadow-[0_0_20px_rgba(45,212,191,0.3)]">
          Get These Signals Live →
        </Link>
        <p className="text-xs text-gray-600 mt-4 max-w-lg mx-auto">Past performance does not guarantee future results. Trading involves substantial risk of loss.</p>
      </div>
    </div>
  );
}
