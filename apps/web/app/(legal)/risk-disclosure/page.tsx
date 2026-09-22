import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trading Risk Disclosure | SmartPulse",
};

const heading = "text-xl font-semibold text-slate-100";
const text = "text-sm leading-7 text-slate-300";

export default function RiskDisclosurePage() {
  return (
    <article className="space-y-10">
      <header className="space-y-4 border-b border-slate-800 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          Important Trading Information
        </p>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Trading Risk Disclosure
        </h1>

        <p className={text}>
          Please read this disclosure before relying on
          SmartPulse market analysis.
        </p>

        <p className="text-xs text-slate-500">
          Last updated: 22 September 2026
        </p>
      </header>

      <section className="space-y-3">
        <h2 className={heading}>
          Trading involves substantial risk
        </h2>

        <p className={text}>
          Forex, commodities, indices, cryptoassets, and other
          financial markets can move rapidly. Leveraged products
          can magnify both gains and losses. You may lose some or
          all of the capital committed to a trade and, depending
          on the product and broker arrangement, losses may be
          substantial.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={heading}>SmartPulse does not execute trades</h2>

        <p className={text}>
          SmartPulse is a research, intelligence, education, and
          journaling platform. It does not place, manage, or
          close brokerage positions on your behalf.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={heading}>Analysis is not a guarantee</h2>

        <p className={text}>
          Market structure, liquidity analysis, fair value gaps,
          order blocks, confluence scores, execution-readiness
          assessments, Trading IQ concepts, and other analytical
          outputs do not guarantee future market behaviour.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={heading}>AI limitations</h2>

        <p className={text}>
          AI explanations may contain mistakes, omissions, or
          interpretations that become outdated as market
          conditions change. AI output should be treated as an
          explanatory aid, not as an instruction to buy, sell,
          or hold an asset.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={heading}>Data limitations</h2>

        <p className={text}>
          Market prices, candles, economic-calendar information,
          provider responses, and derived analysis may be delayed,
          stale, incomplete, or temporarily unavailable.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={heading}>You make the decision</h2>

        <p className={text}>
          SmartPulse is intentionally designed so that the
          platform explains evidence while the trader remains
          responsible for the final decision.
        </p>

        <p className={text}>
          Consider your financial circumstances, experience,
          objectives, and risk tolerance before trading. Where
          appropriate, seek advice from a suitably qualified
          professional.
        </p>
      </section>

      <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
        <h2 className={heading}>Never trade money you cannot afford to lose</h2>

        <p className={`${text} mt-3`}>
          Historical performance, simulated outcomes, journal
          results, confluence scores, and previous successful
          setups are not reliable guarantees of future results.
        </p>
      </section>
    </article>
  );
}