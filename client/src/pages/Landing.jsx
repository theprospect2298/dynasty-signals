import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const stats = [
  { label: 'Years Experience', value: '10+' },
  { label: 'Win Rate', value: '72%' },
  { label: 'Signals Published', value: '500+' },
  { label: 'Subscriber Returns', value: '94% YTD' },
];

const features = [
  { icon: '🎯', title: 'Verified Traders Only', desc: 'Every signal provider is vetted. We verify track records before anyone can publish signals on Dynasty.' },
  { icon: '⚡', title: 'Real-Time Signals', desc: 'Receive buy, sell, and hold signals the moment traders publish them. Never miss a move again.' },
  { icon: '📊', title: 'Full Transparency', desc: 'Every trader\'s win rate, P/L history, and trade log is public. Make informed subscription decisions.' },
  { icon: '💰', title: 'Aligned Incentives', desc: 'Traders earn 85% of subscription revenue. Your success is their success — no conflicts of interest.' },
  { icon: '🔔', title: 'Multi-Asset Coverage', desc: 'Equities, crypto, forex, options, and commodities — find specialists for every market.' },
  { icon: '🛡️', title: 'Risk Management', desc: 'Every signal includes entry, target, and stop-loss levels. Never trade blind again.' },
];

const tiers = [
  { name: 'Basic', price: '$9.99', period: '/mo', color: 'border-gray-700', badge: '', perks: ['1 trader feed', 'Signal notifications', 'Basic stats', 'Entry & exit levels'] },
  { name: 'Pro', price: '$19.99', period: '/mo', color: 'border-brand-500', badge: 'Most Popular', perks: ['Up to 3 trader feeds', 'Priority signals', 'Full trade history', 'Risk/reward analysis', 'Mobile alerts'] },
  { name: 'Premium', price: '$29.99', period: '/mo', color: 'border-purple-500', badge: 'Elite', perks: ['Unlimited trader feeds', 'Instant push alerts', 'Trader chat access', 'Portfolio tracking', 'Profit share program', 'VIP Discord'] },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            <span className="text-brand-400 text-sm font-medium">Live signals from 200+ verified traders</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-6">
            Follow the Best.<br />
            <span className="text-brand-500">Trade Like the Best.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Dynasty Signals connects you with verified professional traders. Get real-time buy/sell signals, full trade transparency, and institutional-grade analysis — starting at $9.99/month.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to={user.role === 'trader' ? '/dashboard' : '/feed'} className="btn-primary text-base px-8 py-3">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base px-8 py-3">
                  Start Free Trial →
                </Link>
                <Link to="/traders" className="btn-secondary text-base px-8 py-3">
                  Browse Traders
                </Link>
              </>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-4">⚠️ For informational purposes only. Not financial advice. Past performance does not guarantee future results.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-800 bg-dark-800/50">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-black text-brand-500 mb-1">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-3">Everything You Need to Trade Smarter</h2>
          <p className="text-gray-500 text-center mb-12">Built for serious traders who want an edge.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="card hover:border-gray-700 transition-colors">
                <span className="text-3xl mb-3 block">{f.icon}</span>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-dark-800/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-3">Simple, Transparent Pricing</h2>
          <p className="text-gray-500 text-center mb-12">Per trader subscription. Subscribe to as many traders as you want.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {tiers.map(t => (
              <div key={t.name} className={`card border-2 ${t.color} relative flex flex-col`}>
                {t.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-0.5 rounded-full bg-brand-500 text-white whitespace-nowrap">
                    {t.badge}
                  </span>
                )}
                <h3 className="text-lg font-bold text-white mb-1">{t.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-black text-white">{t.price}</span>
                  <span className="text-gray-500 text-sm">{t.period} per trader</span>
                </div>
                <ul className="space-y-2 flex-1">
                  {t.perks.map(p => (
                    <li key={p} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-brand-500 shrink-0 mt-0.5">✓</span> {p}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="btn-primary w-full text-center mt-6 block">
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Elevate Your Trading?</h2>
          <p className="text-gray-500 mb-8">Join thousands of traders already using Dynasty Signals. Or become a signal provider and monetize your expertise.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary px-8 py-3 text-base">Create Free Account →</Link>
            <Link to="/traders" className="btn-secondary px-8 py-3 text-base">View Signal Provider</Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="border-t border-gray-800 py-8 px-4 text-center">
        <p className="text-xs text-gray-600 max-w-3xl mx-auto leading-relaxed">
          <strong className="text-gray-500">Risk Disclosure:</strong> Dynasty Signals provides trade signals for informational and educational purposes only. Nothing on this platform constitutes financial advice, investment recommendations, or solicitation to buy or sell securities. Trading involves substantial risk of loss. Past performance of signal providers is not indicative of future results. Always conduct your own research and consult a licensed financial advisor before trading.
        </p>
        <p className="text-xs text-gray-700 mt-4">© 2024 Dynasty Signals. All rights reserved.</p>
      </footer>
    </div>
  );
}
