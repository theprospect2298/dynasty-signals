import { useState, useEffect } from 'react';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function SignalDemo() {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);

  const fullText = 'NVDA — Strong breakout above $850 resistance on massive volume. Earnings catalyst + AI tailwind. Target $950, stop $820.';

  useEffect(() => {
    let alive = true;
    const sequence = async () => {
      while (alive) {
        setStep(0); setTyped(''); setShowNotif(false); setNotifVisible(false);
        await delay(800); if (!alive) return;

        setStep(1);
        for (let i = 0; i <= fullText.length; i++) {
          if (!alive) return;
          setTyped(fullText.slice(0, i));
          await delay(28);
        }
        await delay(600); if (!alive) return;

        setStep(2);
        await delay(1200); if (!alive) return;

        setStep(3);
        await delay(600); if (!alive) return;

        setShowNotif(true);
        await delay(100);
        setNotifVisible(true);
        await delay(2200); if (!alive) return;
        setNotifVisible(false);
        await delay(500);
        setShowNotif(false);

        setStep(4);
        await delay(3500);
      }
    };
    sequence();
    return () => { alive = false; };
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      <div className="relative bg-dark-800 border border-gray-700 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(45,212,191,0.12)] aspect-[9/16] max-h-[520px]">

        <div className="flex items-center justify-between px-5 py-3 bg-dark-900/80 backdrop-blur border-b border-gray-800">
          <span className="text-xs text-gray-400 font-medium">Dynasty Signals</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-xs text-brand-400 font-medium">LIVE</span>
          </div>
        </div>

        <div className="relative h-full bg-dark-900">

          {/* Trader screen */}
          <div className={`absolute inset-0 flex flex-col transition-opacity duration-500 ${step <= 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="px-4 pt-4 pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-cyan-600 flex items-center justify-center text-white text-xs font-black">C</div>
                <div>
                  <p className="text-xs font-bold text-white">Carlos Ventura</p>
                  <p className="text-xs text-brand-400">👑 Publishing Signal</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-hidden">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-dark-700 rounded-lg p-2.5 border border-gray-700">
                  <p className="text-xs text-gray-500 mb-1">Asset</p>
                  <p className="text-sm font-black text-white">NVDA</p>
                </div>
                <div className="bg-green-900/30 rounded-lg p-2.5 border border-green-700/50">
                  <p className="text-xs text-gray-500 mb-1">Action</p>
                  <p className="text-sm font-black text-green-400">● BUY</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[['Entry', '$850', 'text-white'], ['Target', '$950', 'text-green-400'], ['Stop', '$820', 'text-red-400']].map(([l, v, c]) => (
                  <div key={l} className="bg-dark-700 rounded-lg p-2 border border-gray-800 text-center">
                    <p className="text-xs text-gray-500 mb-0.5">{l}</p>
                    <p className={`text-xs font-bold ${c}`}>{v}</p>
                  </div>
                ))}
              </div>

              <div className="bg-dark-700 rounded-lg p-2.5 border border-gray-700">
                <p className="text-xs text-gray-500 mb-1">Timeframe</p>
                <p className="text-xs font-semibold text-white">Swing Trade · 2–3 Weeks</p>
              </div>

              <div className="bg-dark-700 rounded-lg p-2.5 border border-gray-700 min-h-[70px]">
                <p className="text-xs text-gray-500 mb-1">Rationale</p>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {typed}
                  {step === 1 && <span className="inline-block w-0.5 h-3 bg-brand-500 ml-0.5 animate-pulse" />}
                </p>
              </div>

              <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 ${step === 2 ? 'bg-brand-500 text-white shadow-[0_0_20px_rgba(45,212,191,0.5)] scale-95' : 'bg-brand-500/80 text-white'}`}>
                {step === 2 ? '✓ Signal Published!' : '⚡ Publish Signal'}
              </button>

              {step === 2 && (
                <div className="flex items-center justify-center gap-2 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  <span className="text-xs text-brand-400 font-medium">Sending to all subscribers...</span>
                </div>
              )}
            </div>
          </div>

          {/* Follower screen */}
          <div className={`absolute inset-0 flex flex-col transition-opacity duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="px-4 pt-4 pb-3 border-b border-gray-800">
              <p className="text-xs font-bold text-white">📡 My Signal Feed</p>
              <p className="text-xs text-gray-500">Subscribed to Carlos Ventura</p>
            </div>

            {showNotif && (
              <div className={`absolute top-14 left-3 right-3 z-20 transition-all duration-400 ${notifVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                <div className="bg-dark-700 border border-brand-500/50 rounded-xl p-3 shadow-[0_0_20px_rgba(45,212,191,0.2)]">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔔</span>
                    <div>
                      <p className="text-xs font-bold text-white">New Signal from Carlos Ventura</p>
                      <p className="text-xs text-brand-400 font-semibold">BUY NVDA · Entry $850 · Target $950</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 p-4 space-y-3 overflow-hidden">
              <div className="bg-dark-800 border border-gray-800 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-white text-sm">BTC/USD</span>
                  <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full font-bold">BUY</span>
                  <span className="ml-auto text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">✓ +14.3%</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[['Entry', '$42,000'], ['Target', '$48,000'], ['Stop', '$39,000']].map(([l, v]) => (
                    <div key={l} className="bg-dark-700 rounded p-1.5 text-center">
                      <p className="text-xs text-gray-500">{l}</p>
                      <p className="text-xs font-semibold text-gray-300">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`bg-dark-800 border border-brand-500/40 rounded-xl p-3 transition-all duration-700 shadow-[0_0_15px_rgba(45,212,191,0.1)] ${step === 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
                  <span className="text-xs text-brand-400 font-semibold">NEW · Just now</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-white text-sm">NVDA</span>
                  <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full font-bold border border-green-800">BUY</span>
                  <span className="ml-auto text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full">● Active</span>
                </div>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {[['Entry', '$850', 'text-white'], ['Target', '$950', 'text-green-400'], ['Stop', '$820', 'text-red-400']].map(([l, v, c]) => (
                    <div key={l} className="bg-dark-700 rounded p-1.5 text-center">
                      <p className="text-xs text-gray-500">{l}</p>
                      <p className={`text-xs font-bold ${c}`}>{v}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">Breakout above $850 on massive volume. AI tailwind + earnings catalyst.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1.5 rounded-full border transition-all duration-500 whitespace-nowrap ${step <= 2 ? 'bg-brand-500/20 border-brand-500/40 text-brand-400' : 'bg-blue-500/20 border-blue-500/40 text-blue-400'}`}>
        {step <= 2 ? '👤 Carlos Publishing...' : '📱 Subscriber Receiving...'}
      </div>

      <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none" />
    </div>
  );
}
