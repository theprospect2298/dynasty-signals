import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

// ── Animated Signal Demo Component ─────────────────────────────────────────
function SignalDemo() {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);

  const fullText = 'NVDA — Strong breakout above $850 resistance on massive volume. Earnings catalyst + AI tailwind. Target $950, stop $820.';

  // Master sequence
  useEffect(() => {
    const sequence = async () => {
      // Step 0: show trader screen
      setStep(0); setTyped(''); setShowNotif(false); setNotifVisible(false);
      await delay(800);

      // Step 1: type rationale
      setStep(1);
      for (let i = 0; i <= fullText.length; i++) {
        setTyped(fullText.slice(0, i));
        await delay(28);
      }
      await delay(600);

      // Step 2: signal published flash
      setStep(2);
      await delay(1200);

      // Step 3: switch to follower view
      setStep(3);
      await delay(600);

      // Step 4: notification drops in
      setShowNotif(true);
      await delay(100);
      setNotifVisible(true);
      await delay(2200);
      setNotifVisible(false);
      await delay(500);
      setShowNotif(false);

      // Step 5: signal card appears in feed
      setStep(4);
      await delay(3500);

      // Loop
      sequence();
    };
    sequence();
    return () => {};
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      {/* Phone frame */}
      <div className="relative bg-dark-800 border border-gray-700 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(34,197,94,0.12)] aspect-[9/16] max-h-[520px]">

        {/* Status bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-dark-900/80 backdrop-blur border-b border-gray-800">
          <span className="text-xs text-gray-400 font-medium">Dynasty Signals</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-xs text-brand-400 font-medium">LIVE</span>
          </div>
        </div>

        {/* Screen content */}
        <div className="relative h-full bg-dark-900">

          {/* ── TRADER SCREEN (steps 0-2) ── */}
          <div className={`absolute inset-0 flex flex-col transition-opacity duration-500 ${step <= 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center text-white text-xs font-black">C</div>
                <div>
                  <p className="text-xs font-bold text-white">Carlos Ventura</p>
                  <p className="text-xs text-brand-400">👑 Publishing Signal</p>
                </div>
              </div>
            </div>

            {/* Signal form */}
            <div className="flex-1 p-4 space-y-3 overflow-hidden">
              {/* Asset + Action */}
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

              {/* Prices */}
              <div className="grid grid-cols-3 gap-2">
                {[['Entry', '$850', 'text-white'], ['Target', '$950', 'text-green-400'], ['Stop', '$820', 'text-red-400']].map(([l, v, c]) => (
                  <div key={l} className="bg-dark-700 rounded-lg p-2 border border-gray-800 text-center">
                    <p className="text-xs text-gray-500 mb-0.5">{l}</p>
                    <p className={`text-xs font-bold ${c}`}>{v}</p>
                  </div>
                ))}
              </div>

              {/* Timeframe */}
              <div className="bg-dark-700 rounded-lg p-2.5 border border-gray-700">
                <p className="text-xs text-gray-500 mb-1">Timeframe</p>
                <p className="text-xs font-semibold text-white">Swing Trade · 2–3 Weeks</p>
              </div>

              {/* Typed rationale */}
              <div className="bg-dark-700 rounded-lg p-2.5 border border-gray-700 min-h-[70px]">
                <p className="text-xs text-gray-500 mb-1">Rationale</p>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {typed}
                  {step === 1 && <span className="inline-block w-0.5 h-3 bg-brand-500 ml-0.5 animate-pulse" />}
                </p>
              </div>

              {/* Publish button */}
              <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 ${step === 2 ? 'bg-brand-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.5)] scale-95' : 'bg-brand-500/80 text-white'}`}>
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

          {/* ── FOLLOWER SCREEN (steps 3-4) ── */}
          <div className={`absolute inset-0 flex flex-col transition-opacity duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-800">
              <p className="text-xs font-bold text-white">📡 My Signal Feed</p>
              <p className="text-xs text-gray-500">Subscribed to Carlos Ventura</p>
            </div>

            {/* Notification drop */}
            {showNotif && (
              <div className={`absolute top-14 left-3 right-3 z-20 transition-all duration-400 ${notifVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                <div className="bg-dark-700 border border-brand-500/50 rounded-xl p-3 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
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

            {/* Feed */}
            <div className="flex-1 p-4 space-y-3 overflow-hidden">
              {/* Old signal (always visible) */}
              <div className="bg-dark-800 border border-gray-800 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-white text-sm">BTC/USD</span>
                  <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full font-bold">BUY</span>
                  <span className="ml-auto text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">✓ +14.3%</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[['Entry','$42,000'],['Target','$48,000'],['Stop','$39,000']].map(([l,v])=>(
                    <div key={l} className="bg-dark-700 rounded p-1.5 text-center">
                      <p className="text-xs text-gray-500">{l}</p>
                      <p className="text-xs font-semibold text-gray-300">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* New NVDA signal animates in */}
              <div className={`bg-dark-800 border border-brand-500/40 rounded-xl p-3 transition-all duration-700 shadow-[0_0_15px_rgba(34,197,94,0.1)] ${step === 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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
                  {[['Entry','$850','text-white'],['Target','$950','text-green-400'],['Stop','$820','text-red-400']].map(([l,v,c])=>(
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

      {/* Floating label */}
      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1.5 rounded-full border transition-all duration-500 whitespace-nowrap ${step <= 2 ? 'bg-brand-500/20 border-brand-500/40 text-brand-400' : 'bg-blue-500/20 border-blue-500/40 text-blue-400'}`}>
        {step <= 2 ? '👤 Carlos Publishing...' : '📱 Subscriber Receiving...'}
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none" />
    </div>
  );
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Rest of page data ───────────────────────────────────────────────────────
const features = [
  { icon: '🎯', title: 'Verified & Transparent', desc: 'Every signal comes with full trade history, win rate, and P&L data. No hidden results, no cherry-picking.' },
  { icon: '⚡', title: 'Real-Time Alerts', desc: 'Signals are delivered the moment they are published. Be first to act on every trade opportunity.' },
  { icon: '📊', title: 'Full Trade Details', desc: 'Every signal includes asset, direction, entry price, target, and stop loss. Never trade blind again.' },
  { icon: '🛡️', title: 'Risk Management Built In', desc: 'Every trade comes with a defined stop loss. Your downside is always known before you enter.' },
  { icon: '📈', title: 'Multi-Asset Coverage', desc: 'Equities, crypto, forex, and more. One subscription covers every market Carlos trades.' },
  { icon: '💰', title: 'Simple Flat Pricing', desc: 'One low monthly fee. No commissions, no profit splits, no hidden charges. Ever.' },
];

const results = [
  { asset: 'NVDA', action: 'BUY', entry: '$485', exit: '$610', return: '+25.8%', time: '3 weeks' },
  { asset: 'BTC', action: 'BUY', entry: '$38,200', exit: '$52,400', return: '+37.2%', time: '6 weeks' },
  { asset: 'TSLA', action: 'SELL', entry: '$265', exit: '$198', return: '+25.3%', time: '2 weeks' },
  { asset: 'SPY', action: 'BUY', entry: '$442', exit: '$478', return: '+8.1%', time: '1 week' },
  { asset: 'ETH', action: 'BUY', entry: '$2,100', exit: '$3,400', return: '+61.9%', time: '8 weeks' },
  { asset: 'AAPL', action: 'BUY', entry: '$168', exit: '$195', return: '+16.1%', time: '4 weeks' },
];

const testimonials = [
  { name: 'Marcus T.', role: 'Subscriber since 2023', text: 'Carlos called the BTC breakout before anyone else. Up 40% following his signals this year alone.', avatar: 'M' },
  { name: 'Rachel K.', role: 'Full-time trader', text: 'The stop losses alone have saved me from massive mistakes. This is the only signal service I actually trust.', avatar: 'R' },
  { name: 'David L.', role: 'Part-time investor', text: 'I work a 9-5 and don\'t have time to chart all day. Dynasty Signals does the heavy lifting for me.', avatar: 'D' },
];

const tiers = [
  { name: 'Basic', price: '$9.99', color: 'border-gray-700', glow: '', perks: ['Full signal feed access', 'Entry, target & stop loss', 'Trade rationale', 'Performance history'] },
  { name: 'Pro', price: '$19.99', color: 'border-brand-500', glow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]', badge: 'Most Popular', perks: ['Everything in Basic', 'Priority signal alerts', 'Detailed market analysis', 'Risk/reward breakdown', 'Mobile push alerts'] },
  { name: 'Premium', price: '$29.99', color: 'border-yellow-500', glow: 'shadow-[0_0_30px_rgba(234,179,8,0.1)]', badge: '👑 Elite', perks: ['Everything in Pro', 'Instant notifications', 'Full portfolio tracking', 'Weekly market outlook', 'Private Discord access', 'Direct message access'] },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="overflow-hidden">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center px-4 py-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2.5 bg-dark-800 border border-brand-500/30 rounded-full px-5 py-2 mb-8 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
              </span>
              <span className="text-sm text-gray-300 font-medium">Live signals active right now</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Stop Guessing.
              <br />
              <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-emerald-400 bg-clip-text text-transparent">
                Start Winning.
              </span>
            </h1>

            <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-lg">
              Get <span className="text-white font-semibold">Carlos Ventura's</span> real-time trade signals — a professional trader with a verified <span className="text-brand-400 font-semibold">65% win rate</span> and 6+ years of market mastery. Entry, target, stop loss on every trade.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              {user ? (
                <Link to={user.role === 'trader' ? '/dashboard' : '/feed'} className="btn-primary text-base px-10 py-3.5 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-base px-10 py-3.5 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_35px_rgba(34,197,94,0.4)] transition-shadow">
                    Start Free Trial →
                  </Link>
                  <Link to="/traders" className="btn-secondary text-base px-10 py-3.5">
                    View Track Record
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: '65%', label: 'Win Rate' },
                { value: '6+', label: 'Years Exp.' },
                { value: '1+', label: 'Avg R/R' },
                { value: '500+', label: 'Signals' },
              ].map(s => (
                <div key={s.label} className="bg-dark-800/80 backdrop-blur border border-gray-800 rounded-xl py-3 px-2 text-center">
                  <p className="text-xl font-black text-brand-400 mb-0.5">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — animated phone demo */}
          <div className="flex justify-center lg:justify-end pt-8 lg:pt-0">
            <SignalDemo />
          </div>
        </div>
      </section>

      {/* ── RECENT RESULTS ───────────────────────────────────── */}
      <section className="py-20 px-4 bg-dark-800/40 border-y border-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-3 block">Verified Track Record</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Recent Closed Trades</h2>
            <p className="text-gray-500">Every trade is logged publicly. No deleted losses, no cherry-picked wins.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((r, i) => (
              <div key={i} className="bg-dark-800 border border-gray-800 rounded-xl p-5 hover:border-gray-700 hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center font-bold text-white text-sm border border-gray-700">{r.asset.slice(0,3)}</div>
                    <div>
                      <p className="font-bold text-white">{r.asset}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${r.action === 'BUY' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>{r.action}</span>
                    </div>
                  </div>
                  <span className="text-xl font-black text-green-400">{r.return}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[['Entry', r.entry, 'text-white'], ['Exit', r.exit, 'text-green-400'], ['Duration', r.time, 'text-white']].map(([l, v, c]) => (
                    <div key={l} className="bg-dark-700 rounded-lg py-2">
                      <p className="text-xs text-gray-500 mb-0.5">{l}</p>
                      <p className={`text-xs font-semibold ${c}`}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-600 mt-6">Past performance does not guarantee future results.</p>
        </div>
      </section>

      {/* ── ABOUT CARLOS ─────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-4 block">Meet Your Trader</span>
            <h2 className="text-4xl font-black text-white mb-6 leading-tight">A Decade of<br />Market Mastery</h2>
            <p className="text-gray-400 leading-relaxed mb-6">Carlos Ventura has spent 6+ years mastering equities, crypto, and forex. His disciplined risk management and pattern recognition have produced consistent results in bull and bear markets alike.</p>
            <p className="text-gray-400 leading-relaxed mb-8">With Dynasty Signals, Carlos shares every trade in real-time — entry, exit, rationale, and risk levels — so you can follow with full transparency and confidence.</p>
            <div className="grid grid-cols-3 gap-4">
              {[{ v: '65%', l: 'Win Rate' }, { v: '6+', l: 'Years Trading' }, { v: '1+', l: 'Avg R/R' }].map(s => (
                <div key={s.l} className="border border-gray-800 rounded-xl p-4 text-center bg-dark-800">
                  <p className="text-2xl font-black text-brand-400 mb-1">{s.v}</p>
                  <p className="text-xs text-gray-500">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-purple-500/10 rounded-2xl blur-xl" />
            <div className="relative bg-dark-800 border border-gray-800 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-800">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center text-white font-black text-2xl shadow-[0_0_20px_rgba(34,197,94,0.3)]">C</div>
                <div>
                  <p className="font-black text-white text-lg">Carlos Ventura</p>
                  <p className="text-brand-400 text-sm font-medium">👑 Official — Dynasty Signals</p>
                  <p className="text-gray-500 text-xs mt-0.5">Head Trader & Founder</p>
                </div>
              </div>
              <div className="space-y-3">
                {[['Markets', 'Equities · Crypto · Forex'], ['Style', 'Swing & Position Trading'], ['Risk Per Trade', '1–2% Max'], ['Avg Hold Time', '3–21 Days'], ['Avg R/R', '1:1.5 minimum']].map(([l, v]) => (
                  <div key={l} className="flex items-center justify-between py-2 border-b border-gray-800/50">
                    <span className="text-sm text-gray-500">{l}</span>
                    <span className="text-sm font-semibold text-white">{v}</span>
                  </div>
                ))}
              </div>
              <Link to="/traders" className="btn-primary w-full text-center block mt-6 text-sm">View Full Track Record →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-dark-800/30 border-y border-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-3 block">Why Dynasty</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Built for Serious Traders</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Everything you need to follow professional-grade signals with full confidence.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="bg-dark-800 border border-gray-800 rounded-xl p-6 hover:border-gray-700 hover:-translate-y-0.5 transition-all">
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-3 block">Social Proof</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">What Subscribers Say</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {testimonials.map(t => (
              <div key={t.name} className="bg-dark-800 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
                <div className="flex gap-0.5 mb-4">{[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}</div>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shrink-0">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-dark-800/30 border-y border-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-3 block">Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Simple, Flat-Rate Access</h2>
            <p className="text-gray-500">No commissions. No profit splits. Cancel anytime.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {tiers.map(t => (
              <div key={t.name} className={`bg-dark-800 border-2 ${t.color} ${t.glow} rounded-2xl p-6 relative flex flex-col hover:-translate-y-1 transition-all`}>
                {t.badge && <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full bg-brand-500 text-white whitespace-nowrap shadow-lg">{t.badge}</span>}
                <h3 className="text-lg font-bold text-white mb-1">{t.name}</h3>
                <div className="mb-6"><span className="text-4xl font-black text-white">{t.price}</span><span className="text-gray-500 text-sm">/month</span></div>
                <ul className="space-y-3 flex-1 mb-6">
                  {t.perks.map(p => <li key={p} className="flex items-start gap-2.5 text-sm text-gray-400"><span className="text-brand-500 shrink-0 font-bold mt-0.5">✓</span>{p}</li>)}
                </ul>
                <Link to="/register" className={`w-full text-center py-3 rounded-lg font-semibold text-sm transition-colors block ${t.name === 'Pro' ? 'btn-primary' : 'btn-secondary'}`}>Get Started</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-brand-500/5 rounded-full blur-[80px]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">Your Next Winning Trade<br /><span className="text-brand-500">Is One Signal Away.</span></h2>
          <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">Join hundreds of traders already following Carlos Ventura's signals. Start your free trial today.</p>
          <Link to="/register" className="btn-primary text-lg px-12 py-4 shadow-[0_0_40px_rgba(34,197,94,0.25)] hover:shadow-[0_0_50px_rgba(34,197,94,0.35)] transition-shadow inline-block">Start Free Trial →</Link>
          <p className="text-xs text-gray-600 mt-5">No credit card required to browse. Cancel anytime.</p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-gray-800 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">📈</span>
              <span className="font-bold text-white">Dynasty <span className="text-brand-500">Signals</span></span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link to="/traders" className="hover:text-white transition-colors">Track Record</Link>
              <Link to="/register" className="hover:text-white transition-colors">Sign Up</Link>
              <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-xs text-gray-600 leading-relaxed text-center max-w-3xl mx-auto">
              <strong className="text-gray-500">Risk Disclosure:</strong> Dynasty Signals provides trade signals for informational and educational purposes only. Nothing constitutes financial advice or a solicitation to buy or sell any security. Trading involves substantial risk of loss. Past performance is not indicative of future results. Always consult a licensed financial advisor before making investment decisions.
            </p>
            <p className="text-xs text-gray-700 mt-4 text-center">© 2024 Dynasty Signals. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
