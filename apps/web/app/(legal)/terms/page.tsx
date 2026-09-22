import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | SmartPulse",
};

const heading = "text-xl font-semibold text-slate-100";
const text = "text-sm leading-7 text-slate-300";

export default function TermsPage() {
  return (
    <article className="space-y-10">
      <header className="space-y-4 border-b border-slate-800 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
          SmartPulse Legal
        </p>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Terms of Service
        </h1>

        <p className={text}>
          These Terms govern your use of SmartPulse.
        </p>

        <p className="text-xs text-slate-500">
          Last updated: 22 September 2026
        </p>
      </header>

      <section className="space-y-3">
        <h2 className={heading}>1. Operator</h2>

        <p className={text}>
          SmartPulse is currently operated by Jonathan Uchenna
          Nwofoke in Nigeria.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={heading}>2. Eligibility</h2>

        <p className={text}>
          You must be at least 18 years old and legally capable
          of entering into an agreement to create or use a
          SmartPulse account.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={heading}>3. What SmartPulse provides</h2>

        <p className={text}>
          SmartPulse provides market-intelligence, research,
          journaling, educational, analytical, and AI-assisted
          explanation tools for traders.
        </p>

        <p className={text}>
          SmartPulse does not execute trades and does not make
          trading decisions on your behalf.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={heading}>
          4. No investment or financial advice
        </h2>

        <p className={text}>
          SmartPulse content is provided for informational,
          analytical, and educational purposes. It is not
          personalised investment, financial, legal, tax, or
          brokerage advice.
        </p>

        <p className={text}>
          You remain responsible for evaluating information,
          managing risk, and deciding whether to enter, modify,
          or exit any position.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={heading}>5. Accounts</h2>

        <p className={text}>
          You must provide accurate account information and keep
          your login credentials secure. You are responsible for
          activity conducted through your account unless
          applicable law provides otherwise.
        </p>

        <p className={text}>
          You must notify us promptly if you believe your
          account has been compromised.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={heading}>
          6. Plans, subscriptions, and billing
        </h2>

        <p className={text}>
          SmartPulse is designed around Basic, Pro, and Elite
          product tiers. Payments, subscription checkout, and
          verified entitlement enforcement are not currently
          active.
        </p>

        <p className={text}>
          Creating an account does not by itself authorise a
          subscription charge. When paid subscriptions are
          activated, applicable prices, billing periods,
          renewal terms, taxes, cancellation rules, and any
          trial terms will be displayed before purchase.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={heading}>7. Market data and AI</h2>

        <p className={text}>
          Market data, economic-calendar information, derived
          analysis, and AI-generated explanations may be delayed,
          unavailable, incomplete, or incorrect.
        </p>

        <p className={text}>
          AI output is generated from supplied context and must
          not be treated as a guarantee of accuracy, market
          direction, or future performance.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={heading}>8. Acceptable use</h2>

        <p className={text}>
          You must not attempt to bypass access controls,
          interfere with SmartPulse infrastructure, abuse
          provider resources, probe accounts belonging to other
          users, introduce malicious software, scrape the service
          in a way that harms its operation, or use SmartPulse
          unlawfully.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={heading}>9. Intellectual property</h2>

        <p className={text}>
          SmartPulse software, branding, interface, original
          analysis systems, documentation, and related materials
          are protected by applicable intellectual-property laws.
          These Terms do not transfer ownership of SmartPulse to
          you.
        </p>

        <p className={text}>
          You retain responsibility for information and journal
          content you submit to your account.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={heading}>10. Service availability</h2>

        <p className={text}>
          We may maintain, modify, suspend, limit, or discontinue
          parts of SmartPulse. We do not guarantee uninterrupted
          availability of market providers, AI providers,
          authentication systems, or other third-party services.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={heading}>11. Disclaimer</h2>

        <p className={text}>
          To the extent permitted by applicable law, SmartPulse
          is provided without guarantees that its analysis,
          market data, AI output, scoring, or educational
          material will produce any particular trading or
          financial outcome.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={heading}>12. Responsibility for losses</h2>

        <p className={text}>
          Trading involves substantial risk. To the extent
          permitted by applicable law, SmartPulse and its
          operator are not responsible for trading decisions,
          brokerage execution, market losses, or losses caused
          by reliance on market information or analytical output.
        </p>

        <p className={text}>
          Nothing in these Terms excludes rights or liabilities
          that cannot lawfully be excluded.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={heading}>13. Suspension and termination</h2>

        <p className={text}>
          Access may be restricted or terminated where reasonably
          necessary to protect users or the service, respond to
          unlawful activity, enforce these Terms, or meet legal
          obligations.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={heading}>14. Governing law</h2>

        <p className={text}>
          These Terms are governed by the laws of the Federal
          Republic of Nigeria, subject to any mandatory consumer
          or other rights that applicable law in your location
          does not permit you to waive.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={heading}>15. Contact</h2>

        <p className={text}>
          Questions concerning these Terms may be sent to
          jonahsmith5018@gmail.com.
        </p>
      </section>
    </article>
  );
}