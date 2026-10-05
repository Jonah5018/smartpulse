"use client";

import { useId, useMemo, useState } from "react";
import type { MarketCandle } from "@/lib/market";
import { chartEvidence, type ChartAnnotation } from "@/lib/charts/evidence";

const colors = {
  structure: "#fbbf24",
  zone: "#2dd4bf",
  gap: "#818cf8",
  liquidity: "#38bdf8",
};

export function AnnotatedChart({
  history,
  symbol,
}: {
  history: MarketCandle[];
  symbol: string;
}) {
  const [count, setCount] = useState(history.length);
  const [windowSize, setWindowSize] = useState(60);
  const [enabled, setEnabled] = useState({
    structure: true,
    zone: true,
    gap: true,
    liquidity: true,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const clip = useId();
  const evidence = useMemo(
    () => chartEvidence(history, count),
    [history, count],
  );
  const visible = evidence.candles.slice(-windowSize);
  if (!visible.length)
    return (
      <p className="sp-notice">Closed-candle chart data is unavailable.</p>
    );
  const low = Math.min(...visible.map((c) => c.low));
  const high = Math.max(...visible.map((c) => c.high));
  const padding = Math.max((high - low) * 0.08, high * 0.00001);
  const y = (price: number) =>
    300 - ((price - low + padding) / (high - low + padding * 2)) * 270;
  const x = (index: number) =>
    18 + (index * 720) / Math.max(1, visible.length - 1);
  const annotationX = (time: string) =>
    x(
      Math.max(
        0,
        visible.findIndex((c) => c.timestamp >= time),
      ),
    );
  const annotations = evidence.annotations.filter((a) => enabled[a.kind]);
  const detail = annotations.find((a) => a.id === selected);
  const candle = visible[hovered ?? visible.length - 1] ?? visible.at(-1)!;
  const choose = (annotation: ChartAnnotation) => setSelected(annotation.id);
  return (
    <section
      className="sp-panel !p-3 sm:!p-6 space-y-5"
      aria-label="Annotated market chart"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="sp-eyebrow">Read the evidence</p>
          <h2 className="mt-2 text-xl font-semibold">
            {symbol} · {history[0]?.interval}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {count < history.length
              ? "Historical replay"
              : "Latest closed candles"}{" "}
            · single-timeframe study
          </p>
        </div>
        <label className="text-xs text-slate-400">
          Visible candles
          <select
            aria-label="Visible candles"
            className="sp-input mt-1"
            value={windowSize}
            onChange={(e) => setWindowSize(Number(e.target.value))}
          >
            {[30, 60, 120, 200].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-4">
        {(["structure", "zone", "gap", "liquidity"] as const).map((kind) => (
          <label
            key={kind}
            className="flex items-center gap-2 text-xs capitalize"
            style={{ color: colors[kind] }}
          >
            <input
              type="checkbox"
              checked={enabled[kind]}
              onChange={(e) =>
                setEnabled({ ...enabled, [kind]: e.target.checked })
              }
            />
            {kind === "gap"
              ? "Fair value gaps"
              : kind === "zone"
                ? "Supply / demand & reactions"
                : kind === "liquidity"
                  ? "External liquidity"
                  : "Structure breaks"}
          </label>
        ))}
      </div>
      <p
        className="font-mono text-[11px] text-slate-400 break-words"
        aria-live="off"
      >
        {candle.timestamp.replace("T", " ").slice(0, 19)} UTC · O {candle.open}{" "}
        · H {candle.high} · L {candle.low} · C {candle.close}
      </p>
      <svg
        viewBox="0 0 830 340"
        role="img"
        aria-label={symbol + " candlesticks with structural evidence"}
        className="w-full min-h-48 rounded-xl bg-slate-950"
      >
        <defs>
          <clipPath id={clip}>
            <rect x="5" y="5" width="748" height="305" />
          </clipPath>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => {
          const price = low + ((high - low) * i) / 4;
          return (
            <g key={i}>
              <line
                x1="10"
                x2="750"
                y1={y(price)}
                y2={y(price)}
                stroke="#1e293b"
              />
              <text x="760" y={y(price) + 4} fill="#94a3b8" fontSize="11">
                {price.toLocaleString("en-US", { maximumFractionDigits: 5 })}
              </text>
            </g>
          );
        })}
        <g clipPath={`url(#${clip})`}>
          {annotations.map((a) => (
            <g key={a.id} opacity={selected === a.id ? 1 : 0.6}>
              <rect
                x={annotationX(a.time)}
                y={y(a.high)}
                width={750 - annotationX(a.time)}
                height={Math.max(2, y(a.low) - y(a.high))}
                fill={colors[a.kind]}
                fillOpacity=".14"
                stroke={colors[a.kind]}
                strokeDasharray="4 4"
              />
              <text
                x={annotationX(a.time) + 3}
                y={y(a.high) - 5}
                fill={colors[a.kind]}
                fontSize="10"
              >
                {a.label}
              </text>
            </g>
          ))}
          {visible.map((c, i) => {
            const color = c.close >= c.open ? "#2dd4bf" : "#fb7185";
            return (
              <g
                key={c.timestamp}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered(null)}
              >
                <title>{c.timestamp + " close " + c.close}</title>
                <rect
                  x={x(i) - 6}
                  y="0"
                  width="12"
                  height="310"
                  fill="transparent"
                />
                <line
                  x1={x(i)}
                  x2={x(i)}
                  y1={y(c.high)}
                  y2={y(c.low)}
                  stroke={color}
                />
                <rect
                  x={x(i) - Math.max(1, 240 / visible.length)}
                  y={y(Math.max(c.open, c.close))}
                  width={Math.max(2, 480 / visible.length)}
                  height={Math.max(1, Math.abs(y(c.open) - y(c.close)))}
                  fill={color}
                />
              </g>
            );
          })}
        </g>
        <text x="15" y="331" fill="#94a3b8" fontSize="11">
          {visible[0].timestamp.slice(0, 16).replace("T", " ")}
        </text>
        <text x="740" y="331" textAnchor="end" fill="#94a3b8" fontSize="11">
          {visible.at(-1)!.timestamp.slice(0, 16).replace("T", " ")} UTC
        </text>
      </svg>
      <div className="flex flex-wrap gap-2">
        {annotations.map((a) => (
          <button
            key={a.id}
            onClick={() => choose(a)}
            aria-pressed={selected === a.id}
            className="sp-button-secondary !px-3 !py-2 !text-xs"
          >
            {a.label}
          </button>
        ))}
      </div>
      <p className="text-sm leading-6 text-slate-400" aria-live="polite">
        {detail?.explanation ??
          "Select an evidence label to inspect why it is drawn. Zones are observations, not instructions to enter."}
      </p>
      <div className="border-t border-slate-800 pt-5 space-y-3">
        <div className="flex flex-wrap justify-between gap-3">
          <label htmlFor={clip + "-replay"} className="text-sm font-medium">
            Candle replay · {count} / {history.length}
          </label>
          <button
            className="text-xs text-teal-300"
            onClick={() => {
              setCount(history.length);
              setSelected(null);
            }}
          >
            Return to latest
          </button>
        </div>
        <input
          id={clip + "-replay"}
          type="range"
          min={Math.min(20, history.length)}
          max={history.length}
          value={count}
          onChange={(e) => {
            setCount(Number(e.target.value));
            setSelected(null);
            setHovered(null);
          }}
          className="w-full accent-teal-400"
        />
        <div className="flex gap-3">
          <button
            className="sp-button-secondary"
            disabled={count <= 20}
            onClick={() => {
              setCount((c) => Math.max(20, c - 1));
              setSelected(null);
            }}
          >
            Previous candle
          </button>
          <button
            className="sp-button-secondary"
            disabled={count >= history.length}
            onClick={() => {
              setCount((c) => Math.min(history.length, c + 1));
              setSelected(null);
            }}
          >
            Next candle
          </button>
        </div>
        <p className="text-xs leading-5 text-slate-500">
          Evidence is recalculated using only candles visible at this replay
          step. The rest of this page remains the latest multi-timeframe
          analysis. Replay is educational; it does not model fills or backtest
          profitability.
        </p>
      </div>
    </section>
  );
}
