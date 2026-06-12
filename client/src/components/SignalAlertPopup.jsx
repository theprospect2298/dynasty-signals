import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

const fmt = (n) => (n == null || n === '' ? null : '$' + Number(n).toLocaleString());

export default function SignalAlertPopup({ alert, onClose }) {
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();

  const { signal, traderName, traderProfileId } = alert;
  const isBuy = signal.action === 'BUY';
  const isSell = signal.action === 'SELL';
  const accentText = isBuy ? 'text-green-400' : isSell ? 'text-red-400' : 'text-yellow-400';
  const accentBg = isBuy ? 'bg-green-900/40 border-green-700/60' : isSell ? 'bg-red-900/40 border-red-700/60' : 'bg-yellow-900/40 border-yellow-700/60';
  const glowClass = isSell ? 'alert-glow-red' : 'alert-glow-teal';
  const arrow = isBuy ? '▲' : isSell ? '▼' : '◆';

  const dismiss = () => {
    setLeaving(true);
    setTimeout(onClose, 320);
  };

  const view = () => {
    dismiss();
    navigate(`/signals/${traderProfileId}`);
  };

  return (
    <div
      className={`pointer-events-auto relative w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-brand-500/40 bg-dark-800/95 backdrop-blur-md overflow-hidden ${glowClass} ${leaving ? 'signal-alert-out' : 'signal-alert-in'}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="alert"
    >
      {/* Shimmer sweep on entry */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        <div className="alert-shimmer absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Close */}
      <button
        onClick={dismiss}
        aria-label="Dismiss signal alert"
        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-dark-600 transition-colors text-sm"
      >
        ✕
      </button>

      <div className="relative p-4">
        {/* Header: logo with radar pings */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
            <span className="alert-ping absolute inset-0 rounded-full border-2 border-brand-400/70" />
            <span className="alert-ping absolute inset-0 rounded-full border-2 border-brand-400/50" style={{ animationDelay: '0.6s' }} />
            <Logo className="w-9 h-9 relative" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-brand-400 tracking-[0.2em] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              LIVE SIGNAL
            </p>
            <p className="text-xs text-gray-400 truncate">from <span className="text-white font-semibold">{traderName}</span></p>
          </div>
        </div>

        {/* Asset + action */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl font-black text-white tracking-tight">{signal.asset}</span>
          <span className={`text-sm font-black px-2.5 py-1 rounded-lg border ${accentBg} ${accentText}`}>
            {arrow} {signal.action}
          </span>
          {signal.timeframe && (
            <span className="ml-auto mr-6 text-xs text-gray-500 bg-dark-700 px-2 py-0.5 rounded">⏱ {signal.timeframe}</span>
          )}
        </div>

        {/* Levels */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            ['Entry', fmt(signal.entry_price), 'text-white'],
            ['Target', fmt(signal.target_price), 'text-green-400'],
            ['Stop', fmt(signal.stop_loss), 'text-red-400'],
          ].map(([label, value, color]) => (
            <div key={label} className="bg-dark-700/80 border border-gray-800 rounded-lg px-2 py-1.5 text-center">
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-sm font-bold ${color}`}>{value || '—'}</p>
            </div>
          ))}
        </div>

        {signal.rationale && (
          <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2 border-l-2 border-brand-500/60 pl-2.5">
            {signal.rationale}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={view} className="btn-primary flex-1 text-sm py-2 shadow-[0_0_16px_rgba(45,212,191,0.3)]">
            View Signal →
          </button>
          <button onClick={dismiss} className="btn-secondary text-sm py-2 px-4">
            Dismiss
          </button>
        </div>
      </div>

      {/* Auto-dismiss progress bar (pauses on hover) */}
      <div className="h-0.5 bg-dark-600">
        <div
          className={`h-full alert-progress ${isSell ? 'bg-red-400' : 'bg-brand-400'}`}
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
          onAnimationEnd={dismiss}
        />
      </div>
    </div>
  );
}
