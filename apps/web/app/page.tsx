import Link from "next/link";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { HomeMotion } from "@/components/marketing/home-motion";
import styles from "./home.module.css";
import {
  ArrowUpRight,
  Activity,
  ChartCandlestick,
  Layers3,
  BookOpen,
  Radar,
  ShieldCheck,
  ArrowRight,
  Check,
  Play,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SmartPulse — See the structure. Trade with intention.",
  description:
    "Bring market structure, liquidity, economic context and your trading journal into one focused research workspace.",
};

const features = [
  {
    icon: Layers3,
    tag: "01 / CONTEXT",
    title: "The bigger picture, before the entry.",
    text: "Connect higher-timeframe structure with execution-timeframe evidence. See alignment, conflicts and what still needs confirmation.",
    items: ["Multi-timeframe analysis", "ICT / SMC & Advanced Price Action"],
  },
  {
    icon: ChartCandlestick,
    tag: "02 / EVIDENCE",
    title: "Understand what the chart is saying.",
    text: "Explore structure breaks, reaction zones and fair value gaps. Step through closed candles to study how the evidence developed.",
    items: ["Selectable chart annotations", "Causal candle replay"],
  },
  {
    icon: Radar,
    tag: "03 / AWARENESS",
    title: "A watchlist with purpose.",
    text: "Keep the markets you follow close. Bring session availability, economic events and market context into your research routine.",
    items: ["Forex, metals & crypto", "Economic calendar context"],
  },
  {
    icon: BookOpen,
    tag: "04 / REFLECTION",
    title: "Make every decision a lesson.",
    text: "Capture your thesis, save the analysis behind it and review your actual outcomes. Build a record of your process over time.",
    items: [
      "Analysis-linked trade journal",
      "Risk multiples & performance review",
    ],
  },
];

function ResearchPreview() {
  const closes = [
    46, 49, 47, 52, 55, 53, 58, 56, 54, 60, 62, 58, 55, 52, 49, 53, 57, 61, 64,
    62, 67, 72, 69, 74, 79, 75, 81, 86, 83, 89, 92, 88,
  ];
  return (
    <div
      className={`${styles.preview} relative rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 sm:p-6`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Activity size={17} className="text-blue-300" /> Pulse workspace
        </div>
        <span className="rounded-full border border-blue-400/20 bg-blue-400/5 px-3 py-1 text-[10px] uppercase tracking-widest text-blue-300">
          Illustrative preview
        </span>
      </div>
      <div className="mt-5 flex justify-between">
        <div>
          <p className="text-xs text-slate-400">Market structure</p>
          <p className="mt-1 text-lg font-semibold">Context → confirmation</p>
        </div>
        <span className="text-xs text-slate-500">H4 / H1 / M15</span>
      </div>
      <div className={styles.chartEntrance}>
        <svg
          viewBox="0 0 580 270"
          className="my-3 w-full"
          role="img"
          aria-label="Illustration of candlesticks, a demand zone and a structure break, not live market data"
        >
          {[40, 90, 140, 190, 240].map((y) => (
            <line
              key={y}
              x1="0"
              x2="580"
              y1={y}
              y2={y}
              stroke="var(--color-slate-800)"
            />
          ))}
          <rect
            x="35"
            y="175"
            width="490"
            height="30"
            fill="var(--color-blue-400)"
            fillOpacity=".08"
            stroke="var(--color-blue-400)"
            strokeOpacity=".3"
          />
          <text x="44" y="197" fontSize="10" fill="var(--color-blue-300)">
            DEMAND · reaction zone
          </text>
          <line
            x1="185"
            x2="535"
            y1="119"
            y2="119"
            stroke="var(--color-blue-400)"
            strokeDasharray="5 5"
          />
          <text x="420" y="109" fontSize="10" fill="var(--color-blue-300)">
            STRUCTURE BREAK
          </text>
          {closes.map((close, i) => {
            const open = i ? closes[i - 1] : 43;
            const up = close >= open;
            const y = (v: number) => 350 - v * 3;
            return (
              <g key={i}>
                <line
                  x1={20 + i * 17}
                  x2={20 + i * 17}
                  y1={y(Math.max(open, close) + 3)}
                  y2={y(Math.min(open, close) - 3)}
                  stroke={
                    up ? "var(--color-emerald-400)" : "var(--color-rose-300)"
                  }
                />
                <rect
                  x={16 + i * 17}
                  y={y(Math.max(open, close))}
                  width="8"
                  height={Math.max(3, Math.abs(close - open) * 3)}
                  rx="1"
                  fill={
                    up ? "var(--color-emerald-400)" : "var(--color-rose-300)"
                  }
                />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Structure", "Read the context"],
          ["Confirmation", "Wait for evidence"],
          ["Invalidation", "Define the risk"],
        ].map(([title, body]) => (
          <div
            key={title}
            className="rounded-xl border border-slate-800/60 bg-slate-950/70 p-3"
          >
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              {title}
            </p>
            <p className="mt-2 text-xs text-slate-200">{body}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-400">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-blue-400" />{" "}
        Evidence supports a decision. It never guarantees an outcome.
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <HomeMotion>
      <main
        className={`${styles.site} sp-workspace min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-400/20`}
      >
        <a
          href="#features"
          className="sr-only focus:not-sr-only focus:block focus:p-4"
        >
          Skip to features
        </a>
        <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-b border-slate-800/60 px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-semibold tracking-tight"
          >
            <span className="flex size-9 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/10">
              <Activity size={21} className="text-blue-400" />
            </span>
            SmartPulse
            <span className="ml-1 text-xs font-normal text-slate-500">/</span>
          </Link>
          <nav
            aria-label="Website navigation"
            className="hidden gap-7 text-sm text-slate-400 md:flex"
          >
            <a href="#features" className="hover:text-blue-400">
              Platform
            </a>
            <a href="#workflow" className="hover:text-blue-400">
              How it works
            </a>
            <a href="#questions" className="hover:text-blue-400">
              Questions
            </a>
          </nav>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <ThemeToggle />
            <Link href="/login" className="text-slate-300">
              Sign in
            </Link>
            <Link href="/register" className="sp-button-primary">
              Get started
            </Link>
          </div>
        </header>
        <section
          className={`${styles.hero} relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[.95fr_1.05fr] lg:pb-28`}
        >
          <div className={styles.halo} aria-hidden="true" />
          <div className={styles.intro}>
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-300/15 bg-blue-300/5 px-3 py-1.5 text-[11px] uppercase tracking-[.18em] text-blue-300">
              <span className="size-1.5 rounded-full bg-blue-300" /> A clearer
              trading process
            </p>
            <h1 className="mt-7 text-5xl font-medium leading-[1.06] tracking-[-.055em] sm:text-6xl xl:text-7xl">
              Less noise.
              <br />
              More context.
              <br />
              <span className="text-blue-300">Your next edge.</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-8 text-slate-400 sm:text-lg">
              See the structure behind the move. Bring market intelligence,
              chart evidence and your trading journal into one focused
              workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="sp-button-primary px-6 py-3.5">
                Build your process <ArrowUpRight size={18} />
              </Link>
              <a href="#workflow" className="sp-button-secondary px-5 py-3.5">
                <Play size={14} /> Explore the workflow
              </a>
            </div>
            <p className="mt-5 text-xs text-slate-500">
              Research with intention. Review every decision.
            </p>
          </div>
          <ResearchPreview />
        </section>
        <div className="border-y border-slate-800/70 bg-slate-900/30">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-6 text-xs uppercase tracking-[.18em] text-slate-500 sm:px-8">
            <span>One connected research workflow</span>
            {["Forex", "Metals", "Crypto", "Multi-timeframe context"].map(
              (text) => (
                <span key={text} className="text-slate-300">
                  {text}
                </span>
              ),
            )}
          </div>
        </div>
        <section id="features" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div data-home-reveal="" className="max-w-2xl">
            <p className="text-xs uppercase tracking-[.2em] text-blue-300">
              Built around the decision
            </p>
            <h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
              From a market full of movement
              <br className="hidden sm:block" /> to a process you can explain.
            </h2>
            <p className="mt-5 leading-7 text-slate-400">
              A score is only the beginning. SmartPulse helps you inspect the
              reasoning, recognize uncertainty and decide when to wait.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {features.map(({ icon: Icon, tag, title, text, items }) => (
              <article
                key={tag}
                data-home-reveal=""
                className={`${styles.feature} rounded-2xl border border-slate-800/80 bg-slate-900/40 p-7 sm:p-9`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="text-blue-300" size={26} />
                  <span className="text-[10px] tracking-widest text-slate-500">
                    {tag}
                  </span>
                </div>
                <h3 className="mt-8 max-w-sm text-2xl font-medium tracking-tight">
                  {title}
                </h3>
                <p className="mt-4 max-w-lg text-sm leading-7 text-slate-400">
                  {text}
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  {items.map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-2 text-xs text-slate-300"
                    >
                      <Check size={14} className="text-blue-400" />
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          id="workflow"
          className="border-y border-slate-800/70 bg-slate-900/30"
        >
          <div
            data-home-reveal=""
            className="mx-auto max-w-7xl px-5 py-20 sm:px-8"
          >
            <p className="text-xs uppercase tracking-[.2em] text-blue-300">
              A repeatable routine
            </p>
            <div className="mt-6 grid gap-10 lg:grid-cols-4">
              <h2 className="text-3xl font-medium tracking-tight">
                Prepare.
                <br />
                Understand.
                <br />
                Improve.
              </h2>
              {[
                [
                  "01",
                  "Build your focus",
                  "Choose your markets and inspect the session and economic backdrop.",
                ],
                [
                  "02",
                  "Follow the evidence",
                  "Explore structure, liquidity and price action. Check confirmation and invalidation.",
                ],
                [
                  "03",
                  "Close the learning loop",
                  "Record the decision, review execution and use your journal to refine the next one.",
                ],
              ].map(([n, title, text]) => (
                <div key={n}>
                  <span className="font-mono text-sm text-blue-400">{n} —</span>
                  <h3 className="mt-4 text-lg font-medium">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          data-home-reveal=""
          className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 md:grid-cols-2"
        >
          <div>
            <span className="rounded-full border border-amber-300/20 px-3 py-1 text-[10px] uppercase tracking-wider text-amber-200">
              Execution · paper-first preview
            </span>
            <h2 className="mt-5 text-3xl font-medium tracking-tight">
              Discipline before automation.
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-400">
              SmartPulse is developing a controlled execution workspace with
              explicit permissions, setup qualification and risk limits.
              Real-money automated trading is not available.
            </p>
          </div>
          <div
            className={`${styles.callout} rounded-2xl border border-blue-500/20 bg-slate-900/40 p-7`}
          >
            <ShieldCheck className="text-blue-300" />
            <h3 className="mt-4 text-lg font-medium">
              Clear boundaries. Visible reasoning.
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              AI explanations help you understand research. They do not place
              orders. Future MT5 connectivity will require a verified bridge,
              account checks and separate activation.
            </p>
            <Link
              href="/automation"
              className="mt-5 inline-flex items-center gap-2 text-sm text-blue-300"
            >
              Explore the execution workspace <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        <section
          id="questions"
          data-home-reveal=""
          className="mx-auto max-w-3xl px-5 pb-24 sm:px-8"
        >
          <h2 className="mb-8 text-center text-3xl font-medium tracking-tight">
            Before you get started
          </h2>
          {[
            [
              "Does SmartPulse tell me what to buy?",
              "SmartPulse is a research and journaling platform. Its analysis explains evidence, uncertainty and invalidation. It does not guarantee profitable trades or replace your judgment.",
            ],
            [
              "Which markets can I research?",
              "The enabled universe includes selected Forex pairs, gold, silver, Bitcoin and Ethereum. Data availability and subscription access vary. Index coverage is not yet enabled.",
            ],
            [
              "Can I connect MetaTrader 5?",
              "MT5 through a verified bridge is the first planned demo integration. Paper trading comes first; live order execution remains disabled while integration and operational validation are completed.",
            ],
            [
              "How do I choose a plan?",
              "Create an account and review the current plans in Billing. Feature access is checked against your active subscription or eligible trial.",
            ],
          ].map(([q, a]) => (
            <details key={q} className="border-b border-slate-800/80 py-5">
              <summary className="cursor-pointer text-sm font-medium">
                {q}
              </summary>
              <p className="mt-4 text-sm leading-7 text-slate-400">{a}</p>
            </details>
          ))}
        </section>
        <section className="mx-auto mb-20 max-w-7xl px-5 sm:px-8">
          <div
            data-home-reveal=""
            className={`${styles.callout} rounded-3xl border border-blue-500/25 bg-slate-900/60 px-6 py-14 text-center`}
          >
            <p className="text-xs uppercase tracking-[.2em] text-blue-300">
              Your process deserves a workspace
            </p>
            <h2 className="mt-5 text-3xl font-medium tracking-tight sm:text-5xl">
              Make your next decision
              <br />a more informed one.
            </h2>
            <Link
              href="/register"
              className="sp-button-primary mt-8 px-6 py-3.5"
            >
              Start with SmartPulse <ArrowUpRight size={17} />
            </Link>
          </div>
        </section>
        <footer className="mx-auto max-w-7xl border-t border-slate-800/80 px-5 py-9 sm:px-8">
          <div className="flex flex-wrap justify-between gap-5">
            <span className="text-sm font-semibold">SmartPulse</span>
            <nav
              aria-label="Legal"
              className="flex flex-wrap gap-5 text-xs text-slate-400"
            >
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/risk-disclosure">Risk disclosure</Link>
            </nav>
          </div>
          <p className="mt-6 max-w-3xl text-xs leading-6 text-slate-500">
            Trading involves risk. SmartPulse provides market research and
            record-keeping tools, not personalized financial advice. Market data
            may be delayed or unavailable. Illustrations on this page are not
            live signals or performance results.
          </p>
        </footer>
      </main>
    </HomeMotion>
  );
}
