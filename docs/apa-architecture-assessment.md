# APA and multi-asset assessment — 28 September 2026

Assessment completed before production edits. Baseline: `85d0e08`, clean working tree, 49 tests passing in 12 files.

## Existing architecture and reuse decisions

| Capability | Live implementation | Extension, reuse and conflicts |
| --- | --- | --- |
| Instruments | `lib/market/market-universe.ts` | Existing priority/tier/enabled registry drives analysis. Extend this rather than adding a competing registry. |
| Onboarding instruments | `lib/markets/registry.ts`, two MarketService facades | Separate six-instrument list and legacy starter/trial names conflict with billing. Replace definitions with compatibility projections of the analysis registry; preserve existing imports and saved preferences. |
| Billing | `lib/billing/entitlement.ts`, `access.ts`, protected Intelligence loader | Real Basic/Pro/Elite entitlements now exist. Keep the Pro gate, payment/auth flows and database untouched. Put configurable instrument eligibility alongside billing, not inside engines. |
| Provider | `lib/providers/market-data/twelve-data-provider.ts` | Normalizes OHLC and typed errors, has 15-second timeout. Add canonical mapping, strict UTC/chronology, single-quote parsing and unsupported input handling. Never synthesize missing prices, changes or timestamps. |
| Shared data | `lib/repositories/market/market-repository.ts`, `lib/cache/market-cache.ts` | Reuse 60-second cache, single-flight and 429 cooldown. Canonicalize keys, reuse per-symbol quotes across overlapping baskets, bound provider concurrency and credits. Process-local caches are not a distributed quota guarantee. |
| Structure | `lib/market-structure/market-structure-analyzer.ts` | Live confirmed fractal swings/HH/HL/LH/LL/BOS/CHOCH. Expose those swings for reuse; fix repeated breaks of already-broken older levels. Legacy `lib/institutional/market-structure` is a separate representation: do not start another engine. |
| Multi-timeframe | `lib/multi-timeframe/*` | Currently fetches H4 twice and repeats execution structure. Reuse precomputed timeframe contexts; fix the incompatible alignment type cast and Daily relabeling. |
| Liquidity | `lib/institutional/liquidity/*` | Live setup uses this detector; `lib/liquidity/*` also powers a legacy ladder. Extend the live detector using confirmed swings, prior pools and explicit interactions. No speculative order-flow inference. |
| Imbalance/FVG | `lib/imbalance/*` | Reuse detector. Direction-agnostic mitigation currently counts candles on the wrong side as fills. Correct and test fresh/partial/full mitigation. |
| Displacement/order blocks/location | `lib/institutional/{displacement,order-block,premium-discount}` | Reuse; strengthen displacement against prior candle baselines and structural consequence. APA zones derive from existing swings/order blocks and candle observations. |
| Institutional orchestration | `lib/institutional-setup/*` | Central integration seam: assemble normalized timeframe data once, add APA evidence and feed the same result to downstream consumers. Preserve existing output fields. |
| Confluence | `lib/institutional/confluence/*` | Existing 25/20/15/10/10/20 budget. Fix truthy empty order-block scoring and direction/location checks; qualify existing factors with APA, without a second score or arbitrary extra weights. |
| Scanner | `lib/market-scanner/*`, application market/intelligence loaders | Currently deep-analyzes all enabled instruments. Bound discovery, rotate quote coverage, reuse repository data, prioritize requested market and avoid fabricated zero movement. Crypto must not inherit Forex weekend closure. |
| Macro/calendar | `lib/macro/*`, `lib/economic-calendar/*`, provider adapters | Preserve existing independently loaded context, unknown/unavailable states and confluence matrix. No invented macro releases, index calendars, spreads or volume. |
| Explainability | institutional explanation, trade-journal, AI context builder, protected Intelligence page | Add contextual APA evidence to existing output/narrative and disclosure, using profile learning mode for presentation only. Preserve Journal snapshots and the established visual language. |
| Tests | Vitest, `lib/testing`, repository/provider/application regressions | Extend deterministic OHLC fixtures, alias/cache/rate-limit tests and integration regressions. No claim of strategy profitability from unit tests. |

## Provider evidence and activation

Twelve Data's public `forex_pairs` catalogue was fetched successfully with Node on 28 September: all 11 requested Forex pairs are listed. Its `cryptocurrencies` catalogue lists BTC/USD and ETH/USD. Silver is confirmed at https://twelvedata.com/markets/979600/commodity/xag-usd; gold is already working. Catalogue support does not guarantee this account's subscription access.

US index identifiers will remain disabled without verified provider mappings and exchange schedules. NAS100/NDX/NASDAQ100/USTEC/US100 can identify the same configured benchmark; this does not claim broker CFD prices are interchangeable with cash indices.

Official provider documentation: https://twelvedata.com/docs and https://support.twelvedata.com/en/articles/5615854-credits. Batch requests consume credits per symbol; concurrency alone is insufficient. Configure a conservative local credit budget and document multi-process limitations.

## Migration and validation plan

Keep persisted display symbols and public output compatibility while canonical IDs become registry/cache identities. Do not migrate or rewrite Journal/profile/billing tables. Unknown preferences may remain stored for compatibility, but cannot reach providers or silently select a different instrument. Extend in logical phases: registry/mapping; repository/scanner; shared context and detectors; APA/confluence/presentation; domain and regression tests; typecheck/lint/build/diff review.

Known debt to avoid obscuring: duplicate legacy detector representations, process-local snapshots, incomplete calendar coverage, existing neutral-summary/alignment bugs, and uncalibrated heuristic confidence. Optional Daily/M5 data is not to be fabricated or fetched solely to populate a UI field. Weekly/session levels require sufficient confirmed history and explicit timezone/session definitions; absent data must be labeled unavailable.
