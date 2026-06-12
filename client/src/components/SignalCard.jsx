export default function SignalCard({ signal, showTrader = false }) {
  const actionClass = signal.action === 'BUY' ? 'badge-buy' : signal.action === 'SELL' ? 'badge-sell' : 'badge-hold';
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return 'Just now';
  };

  return (
    <div className="card hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white">{signal.asset}</span>
          <span className={actionClass}>{signal.action}</span>
          {signal.status === 'active' && <span className="badge-active">● Live</span>}
          {signal.status === 'closed' && signal.result === 'win' && (
            <span className="badge-win">✓ +{signal.profit_loss_pct?.toFixed(1)}%</span>
          )}
          {signal.status === 'closed' && signal.result === 'loss' && (
            <span className="badge-loss">✗ {signal.profit_loss_pct?.toFixed(1)}%</span>
          )}
          {signal.status === 'cancelled' && (
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">Cancelled</span>
          )}
        </div>
        <span className="text-xs text-gray-500 shrink-0">{timeAgo(signal.created_at)}</span>
      </div>

      {showTrader && signal.trader_name && (
        <p className="text-xs text-brand-400 mb-2 font-medium">by {signal.trader_name}</p>
      )}

      <div className="grid grid-cols-3 gap-3 mb-3">
        {signal.entry_price && (
          <div className="stat-card py-2">
            <p className="text-xs text-gray-500 mb-0.5">Entry</p>
            <p className="text-sm font-semibold text-white">${signal.entry_price.toLocaleString()}</p>
          </div>
        )}
        {signal.target_price && (
          <div className="stat-card py-2">
            <p className="text-xs text-gray-500 mb-0.5">Target</p>
            <p className="text-sm font-semibold text-green-400">${signal.target_price.toLocaleString()}</p>
          </div>
        )}
        {signal.stop_loss && (
          <div className="stat-card py-2">
            <p className="text-xs text-gray-500 mb-0.5">Stop Loss</p>
            <p className="text-sm font-semibold text-red-400">${signal.stop_loss.toLocaleString()}</p>
          </div>
        )}
      </div>

      {signal.timeframe && (
        <span className="text-xs text-gray-500 bg-dark-700 px-2 py-0.5 rounded mr-2">⏱ {signal.timeframe}</span>
      )}

      {signal.rationale && (
        <p className="text-sm text-gray-400 mt-3 leading-relaxed border-t border-gray-800 pt-3">{signal.rationale}</p>
      )}
    </div>
  );
}
