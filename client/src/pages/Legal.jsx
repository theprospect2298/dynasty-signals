const COMPANY = 'Dynasty Signals';

function LegalShell({ title, updated, children }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-2">{title}</h1>
      <p className="text-xs text-gray-500 mb-10">Last updated: {updated}</p>
      <div className="space-y-8 text-sm text-gray-400 leading-relaxed [&_h2]:text-white [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {children}
      </div>
      <p className="text-xs text-gray-600 mt-12 border-t border-gray-800 pt-6">
        This document is a general template provided for convenience and does not constitute legal advice. Have it reviewed by a licensed attorney in your jurisdiction before relying on it.
      </p>
    </div>
  );
}

export function Terms() {
  return (
    <LegalShell title="Terms of Service" updated="June 2026">
      <section>
        <h2>1. The Service</h2>
        <p>{COMPANY} is a subscription platform where a signal provider publishes trade ideas ("signals") containing instrument, direction, entry, target, and stop-loss levels. Signals are commentary and education — {COMPANY} does not execute trades, hold funds, manage accounts, or provide individualized investment advice.</p>
      </section>
      <section>
        <h2>2. Not Financial Advice</h2>
        <p>Nothing on this platform constitutes financial, investment, legal, or tax advice, or a recommendation or solicitation to buy or sell any security, future, currency, or digital asset. Signals reflect the provider's personal opinions at the time of publication. You alone are responsible for your trading decisions, position sizing, and risk management. Consult a licensed financial advisor before acting on any information from {COMPANY}.</p>
      </section>
      <section>
        <h2>3. Accounts</h2>
        <ul>
          <li>You must be at least 18 years old and provide accurate registration information.</li>
          <li>You are responsible for safeguarding your password and all activity under your account.</li>
          <li>Sharing, reselling, screenshotting for redistribution, or otherwise leaking subscriber-only signals is prohibited and grounds for immediate termination without refund.</li>
        </ul>
      </section>
      <section>
        <h2>4. Subscriptions & Billing</h2>
        <ul>
          <li>Subscriptions are billed monthly in advance and renew automatically until cancelled.</li>
          <li>You can cancel at any time; access continues through the end of the paid period.</li>
          <li>Except where required by law, payments are non-refundable. Billing disputes must be raised within 30 days.</li>
          <li>Prices may change with at least 14 days' notice; changes apply from your next renewal.</li>
        </ul>
      </section>
      <section>
        <h2>5. Performance Claims</h2>
        <p>Published statistics (win rate, returns, trade history) describe past signals only. Past performance does not guarantee future results. Your results will differ based on execution, timing, fees, slippage, and position sizing.</p>
      </section>
      <section>
        <h2>6. Intellectual Property</h2>
        <p>All content on {COMPANY} — signals, analysis, branding, software — belongs to {COMPANY} or its licensors. Your subscription grants a personal, non-transferable license to view content for your own trading. No redistribution.</p>
      </section>
      <section>
        <h2>7. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, {COMPANY} and its operator are not liable for any trading losses, lost profits, or indirect, incidental, or consequential damages arising from use of the service. Total aggregate liability is limited to the fees you paid in the three months preceding the claim.</p>
      </section>
      <section>
        <h2>8. Termination</h2>
        <p>We may suspend or terminate accounts that violate these terms, abuse the platform, or attempt to redistribute content. You may delete your account at any time.</p>
      </section>
      <section>
        <h2>9. Changes</h2>
        <p>We may update these terms; material changes will be announced in-app or by email. Continued use after changes take effect constitutes acceptance.</p>
      </section>
    </LegalShell>
  );
}

export function Privacy() {
  return (
    <LegalShell title="Privacy Policy" updated="June 2026">
      <section>
        <h2>1. What We Collect</h2>
        <ul>
          <li><strong className="text-gray-300">Account data</strong> — name, email, and a hashed password (we never store plain-text passwords).</li>
          <li><strong className="text-gray-300">Subscription data</strong> — which plan you're on and its status. Card details are processed by our payment provider and never touch our servers.</li>
          <li><strong className="text-gray-300">Notification data</strong> — browser push subscriptions you opt into, deleted when revoked or expired.</li>
          <li><strong className="text-gray-300">Usage basics</strong> — standard server logs (IP, timestamps) for security and debugging.</li>
        </ul>
      </section>
      <section>
        <h2>2. How We Use It</h2>
        <p>To operate the service: deliver signals and notifications you've subscribed to, process payments, secure accounts, and respond to support requests. We do not sell your personal data, and we do not use it for third-party advertising.</p>
      </section>
      <section>
        <h2>3. Emails</h2>
        <p>We send transactional emails (signal alerts, trade results, password resets, billing notices). You can disable signal alert emails by cancelling your subscription or contacting support.</p>
      </section>
      <section>
        <h2>4. Data Retention & Deletion</h2>
        <p>Account data is kept while your account is active. On request we will delete your account and associated personal data, except records we must retain for legal or accounting purposes.</p>
      </section>
      <section>
        <h2>5. Security</h2>
        <p>Passwords are hashed with bcrypt, traffic is encrypted in transit (HTTPS), and access to production data is restricted to the operator.</p>
      </section>
      <section>
        <h2>6. Contact</h2>
        <p>Privacy questions or deletion requests: contact support through the app or the email listed on our site.</p>
      </section>
    </LegalShell>
  );
}

export function RiskDisclosure() {
  return (
    <LegalShell title="Risk Disclosure" updated="June 2026">
      <section>
        <h2>Trading Involves Substantial Risk of Loss</h2>
        <p>Trading futures, stocks, options, forex, and cryptocurrencies carries a high level of risk and is not suitable for every investor. You can lose some or all of your invested capital — and with leveraged instruments such as futures and forex, losses can exceed your initial deposit. Never trade with money you cannot afford to lose.</p>
      </section>
      <section>
        <h2>Signals Are Opinions, Not Instructions</h2>
        <p>Every signal published on {COMPANY} is the personal market opinion of the signal provider at the moment of publication. Markets move; by the time you see a signal, conditions may have changed. You are solely responsible for deciding whether, when, and at what size to enter any trade.</p>
      </section>
      <section>
        <h2>Past Performance Is Not Indicative of Future Results</h2>
        <p>Published win rates, returns, and trade histories are historical. No representation is made that any account will or is likely to achieve profits or losses similar to those shown. Hypothetical or simulated performance has inherent limitations.</p>
      </section>
      <section>
        <h2>Execution Differences</h2>
        <p>Your fills will differ from published entry, stop, and target levels due to spread, slippage, commissions, latency, and broker differences. Small differences compound: your results will not match the published track record exactly.</p>
      </section>
      <section>
        <h2>No Regulatory Registration</h2>
        <p>{COMPANY} and its operator are not a registered investment advisor, broker-dealer, commodity trading advisor, or financial planner. The service provides general, impersonal market commentary that is not tailored to any individual's financial situation.</p>
      </section>
      <section>
        <h2>Your Acknowledgment</h2>
        <p>By subscribing, you confirm that you understand these risks, that you will independently evaluate every trade, and that you accept full responsibility for all trading decisions and outcomes.</p>
      </section>
    </LegalShell>
  );
}
