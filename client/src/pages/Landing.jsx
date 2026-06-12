import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
  {
    name: 'Basic',
    price: '$9.99',
    color: 'border-gray-700',
    glow: '',
    perks: ['Full signal feed access', 'Entry, target & stop loss', 'Trade rationale', 'Performance history'],
  },
  {
    name: 'Pro',
    price: '$19.99',
    color: 'border-brand-500',
    glow: 'shadow-[0_0_30px_rgba(34,197,94,0.15)]',
    badge: 'Most Popular',
    perks: ['Everything in Basic', 'Priority signal alerts', 'Detailed market analysis', 'Risk/reward breakdown', 'Mobile push alerts'],
  },
  {
    name: 'Premium',
    price: '$29.99',
    color: 'border-yellow-500',
    glow: 'shadow-[0_0_30px_rgba(234,179,8,0.1)]',
    badge: '👑 Elite',
    perks: ['Everything in Pro', 'Instant notifications', 'Full portfolio tracking', 'Weekly market outlook', 'Private Discord access', 'Direct message access'],
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="overflow-hidden">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-4 py-20">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2.5 bg-dark-800 border border-brand-500/30 rounded-full px-5 py-2 mb-10 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            <span className="text-sm text-gray-300 font-medium">Live signals active now</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
            Stop Guessing.
            <br />
            <span className="relative">
              <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-emerald-400 bg-clip-text text-transparent">
                Start Winning.
              </span>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Dynasty Signals gives you direct access to <span className="text-white font-semibold">Carlos Ventura's</span> trade signals — a professional trader with a verified <span className="text-brand-400 font-semibold">72% win rate</span> and over a decade of market experience.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {user ? (
              <Link to={user.role === 'trader' ? '/dashboard' : '/feed'} className="btn-primary text-base px-10 py-3.5 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base px-10 py-3.5 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-shadow">
                  Start Free Trial →
                </Link>
                <Link to="/traders" className="btn-secondary text-base px-10 py-3.5">
                  View Track Record
                </Link>
              </>
            )}
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: '72%', label: 'Win Rate' },
              { value: '10+', label: 'Years Experience' },
              { value: '$2.4M+', label: 'Tracked Returns' },
              { value: '500+', label: 'Signals Published' },
            ].map(s => (
              <div key={s.label} className="bg-dark-800/80 backdrop-blur border border-gray-800 rounded-xl py-4 px-3">
                <p className="text-2xl font-black text-brand-400 mb-0.5">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
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
              <div key={i} className="bg-dark-800 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center font-bold text-white text-sm border border-gray-700">
                      {r.asset.slice(0,3)}
                    </div>
                    <div>
                      <p className="font-bold text-white">{r.asset}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${r.action === 'BUY' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                        {r.action}
                      </span>
                    </div>
                  </div>
                  <span className="text-xl font-black text-green-400">{r.return}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-dark-700 rounded-lg py-2">
                    <p className="text-xs text-gray-500 mb-0.5">Entry</p>
                    <p className="text-xs font-semibold text-white">{r.entry}</p>
                  </div>
                  <div className="bg-dark-700 rounded-lg py-2">
                    <p className="text-xs text-gray-500 mb-0.5">Exit</p>
                    <p className="text-xs font-semibold text-green-400">{r.exit}</p>
                  </div>
                  <div className="bg-dark-700 rounded-lg py-2">
                    <p className="text-xs text-gray-500 mb-0.5">Duration</p>
                    <p className="text-xs font-semibold text-white">{r.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-600 mt-6">Past performance does not guarantee future results. All trades shown are for illustrative purposes.</p>
        </div>
      </section>

      {/* ── ABOUT CARLOS ─────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-4 block">Meet Your Trader</span>
              <h2 className="text-4xl font-black text-white mb-6 leading-tight">
                A Decade of<br />Market Mastery
              </h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Carlos Ventura has spent over 10 years mastering the markets — from equities and options to crypto and forex. His disciplined approach to risk management and pattern recognition has produced consistent results across all market conditions.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8">
                With Dynasty Signals, Carlos shares every trade in real-time — entry, exit, rationale, and risk levels — so subscribers can follow along with full transparency.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { v: '72%', l: 'Win Rate' },
                  { v: '10+', l: 'Years Trading' },
                  { v: '2.1x', l: 'Avg Risk/Reward' },
                ].map(s => (
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
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center text-white font-black text-2xl shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                    C
                  </div>
                  <div>
                    <p className="font-black text-white text-lg">Carlos Ventura</p>
                    <p className="text-brand-400 text-sm font-medium">👑 Official — Dynasty Signals</p>
                    <p className="text-gray-500 text-xs mt-0.5">Head Trader & Founder</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Markets', value: 'Equities · Crypto · Forex' },
                    { label: 'Style', value: 'Swing & Position Trading' },
                    { label: 'Risk Per Trade', value: '1–2% Max' },
                    { label: 'Avg Hold Time', value: '3–21 Days' },
                    { label: 'Signals/Month', value: '8–15 Trades' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-800/50">
                      <span className="text-sm text-gray-500">{item.label}</span>
                      <span className="text-sm font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
                <Link to="/traders" className="btn-primary w-full text-center block mt-6 text-sm">
                  View Full Track Record →
                </Link>
              </div>
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
            <p className="text-gray-500 max-w-xl mx-auto">Everything you need to follow professional-grade signals with confidence.</p>
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
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {t.avatar}
                  </div>
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
              <div key={t.name} className={`bg-dark-800 border-2 ${t.color} ${t.glow} rounded-2xl p-6 relative flex flex-col transition-all hover:-translate-y-1`}>
                {t.badge && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full bg-brand-500 text-white whitespace-nowrap shadow-lg">
                    {t.badge}
                  </span>
                )}
                <h3 className="text-lg font-bold text-white mb-1">{t.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black text-white">{t.price}</span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {t.perks.map(p => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-gray-400">
                      <span className="text-brand-500 shrink-0 font-bold mt-0.5">✓</span> {p}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`w-full text-center py-3 rounded-lg font-semibold text-sm transition-colors block ${t.name === 'Pro' ? 'btn-primary' : 'btn-secondary'}`}>
                  Get Started
                </Link>
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
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
            Your Next Winning Trade<br />
            <span className="text-brand-500">Is One Signal Away.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
            Join hundreds of traders already following Carlos Ventura's signals. Start your free trial today.
          </p>
          <Link to="/register" className="btn-primary text-lg px-12 py-4 shadow-[0_0_40px_rgba(34,197,94,0.25)] hover:shadow-[0_0_50px_rgba(34,197,94,0.35)] transition-shadow inline-block">
            Start Free Trial →
          </Link>
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
              <strong className="text-gray-500">Risk Disclosure:</strong> Dynasty Signals provides trade signals for informational and educational purposes only. Nothing on this platform constitutes financial advice or a solicitation to buy or sell any security. Trading involves substantial risk of loss and is not appropriate for all investors. Past performance is not indicative of future results. Always conduct your own due diligence and consult a licensed financial advisor before making any investment decisions.
            </p>
            <p className="text-xs text-gray-700 mt-4 text-center">© 2024 Dynasty Signals. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
