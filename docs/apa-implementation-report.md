# SmartPulse APA and multi-asset implementation report

29 September 2026. Repository baseline: `85d0e08`.

The core implementation is in the local working tree. Automated domain and regression verification passes. Release verification is **not complete**: the production bundle compiled, but Windows denied Next.js worker creation (`spawn EPERM`); the browser connector failed before loading tabs. No deployment, database migration, commit or push was performed.

1. **Architecture discovered.** Next.js App Router pages call application loaders, which orchestrate existing institutional, macro, economic-calendar and AI services. MarketRepository fronts the Twelve Data adapter and shared candle cache. Billing computes trusted effective plans. See [the pre-implementation assessment](apa-architecture-assessment.md) for the service map and migration decisions.

2. **Existing ICT/SMC functionality found.** Confirmed swing structure, HH/HL/LH/LL, BOS/CHOCH, liquidity pools/sweeps, order blocks, displacement, FVGs, premium/discount, multi-timeframe analysis, confluence, execution readiness, explanation, AI briefs and journal snapshots were already present. A separate legacy structure representation, MSS module and liquidity ladder also exist.

3. **Functionality reused.** The live swing analyzer, FVG detector, order-block engine, premium/discount engine, confluence budget, setup orchestration, billing gate, macro/calendar loaders and UI components remain the integration points. APA consumes their evidence. Internal and external pivots use the same analyzer with different confirmation windows. Higher-timeframe FVGs use the same detector on already-loaded candles.

4. **APA functionality added.** Internal/external context; protected swings requiring subsequent structural consequence; directional liquidity interactions; support/resistance and supply/demand zones; distinct retest episodes, mitigation and possible role reversal; relative displacement; contextual candle patterns, compression/expansion; confirmed/weak/failed/retested breakout assessments; seven evidence states; directional continuation/reversal classifications; target and invalidation references; conflicts, missing information and waiting conditions. Complete previous-day/week **UTC** levels are exposed only when the existing samples contain every expected bar. No separate APA score was added.

5. **Market-universe architecture.** `lib/market/market-universe.ts` is the authoritative registry. The old onboarding registry is now a projection. Asset class, category, enabled state, aliases, canonical identity, provider mappings, priority and existing tier metadata live together. Grouped navigation derives from that metadata.

6. **Activated instruments.** Fifteen configured instruments: EUR/USD, GBP/USD, USD/JPY, USD/CHF, USD/CAD, AUD/USD, NZD/USD, GBP/JPY, EUR/JPY, EUR/GBP, AUD/JPY, XAU/USD, XAG/USD, BTC/USD and ETH/USD. Activation means they are eligible for requests; it does not guarantee the account's provider subscription serves every instrument.

7. **Configured but inactive.** NAS100, SP500 and US30. Their benchmark aliases resolve, but provider mappings and exchange calendars remain unverified, so requests cannot silently invent index support.

8. **Canonical identity.** Registry lookups accept compact, slash-separated and documented aliases. Cache identities use canonical IDs. Display symbols remain compatible with saved preferences, journal records and public output. Unknown stored preferences may be retained; provider/application boundaries reject unsupported requests instead of silently changing the selected market.

9. **Provider mappings.** Explicit Twelve Data mappings exist for the fifteen enabled instruments. The Forex and crypto catalogues were checked during assessment; metals use existing gold support and the official silver instrument page. Sources: [Twelve Data documentation](https://twelvedata.com/docs), [credit accounting](https://support.twelvedata.com/en/articles/5615854-credits), [silver listing](https://twelvedata.com/markets/979600/commodity/xag-usd). Broker CFDs and cash benchmarks are not treated as interchangeable price feeds.

10. **Caching and retrieval.** Provider/canonical-instrument/timeframe/history-size keys separate candle requests. In-flight work is shared, as are per-instrument quotes across overlapping baskets. Candles and quotes have a 60-second local TTL. Alias requests reuse the same entries. Required timeframe contexts load once; incomplete bars cannot confirm live structure. Short or stale history becomes an explicit error. Missing prices, changes, timestamps and bid/ask spreads are not fabricated.

11. **Scanner changes.** Each request-driven minute window covers at most four open instruments. The dashboard deep-analyzes one; selected-market Intelligence prioritizes the requested symbol and considers at most one additional candidate. Quotes and candles reuse repository caches. Crypto remains eligible at weekends. Markets overview explicitly describes partial scan coverage, and cards use per-instrument availability. This is rotation on requests, not a newly installed background scheduler.

12. **Confluence changes.** Preserved the existing factor budget: structure 25, liquidity 20, order block 15, FVG 10, location 10, displacement 20. Undetected order-block objects no longer earn points. FVGs must be sufficiently strong, directionally aligned and not fully filled. Order-block points require an overlapping usable zone. Opposite-direction sweeps/displacement do not earn aligned confirmations. Conflicts and unconfirmed breaks prevent validity. Premium/discount is direction-aware; its existing ten-point budget is symmetric. Execution still requires appropriate direction, entry evidence and risk/reward, including a ratio of at least two.

13. **Pulse Intelligence.** A price-action disclosure uses the existing visual language, responsive grids and native expandable sections. It shows setup state, location, breakout quality, zones, calendar levels, higher-timeframe imbalances, target, invalidation, conflicts and waiting conditions. Learning mode changes wording, not the analytical engine. The existing explanation and AI prompt carry the combined evidence and explicitly prohibit upgrading uncertainty into certainty. Market selectors now group instruments by registry metadata.

14. **Entitlements.** Instrument eligibility is separated into the existing billing layer: Basic covers the seven Forex majors; Pro/Elite cover enabled instruments. The existing Pro feature gate for Pulse Intelligence remains authoritative. Trials use the trusted effective plan already computed by billing. Legacy onboarding `starter` is mapped to Basic; a bare legacy `trial` token does not grant access. No payment, authentication or subscription database changes were made.

15. **Files created.** The new production modules cover analysis context, price-action reasoning, reference levels, admission control, scan scheduling, market eligibility and presentation. New fixture/test modules and both engineering reports are listed in the file inventory below.

16. **Files modified.** Changes are confined to the relevant market, provider, institutional, application and presentation paths plus two existing tests whose scanner expectations changed. The file inventory below is relative to the repository root. Auth, profile persistence, payment handlers, journal writes and legal pages were not changed.

17. **Tests added.** Eight new test files add 75 cases to the original 49. Coverage includes canonical aliases and inactive indices; every enabled asset class; eligibility; weekend crypto scans; credit windows, concurrency and cooldown; quote/candle parsing and errors; request deduplication, cache expiry and overlapping baskets; structure in Forex/metal/crypto price scales; BOS/CHOCH; internal/external confirmation; touch/sweep/close distinctions; equal levels and consumed targets; supply/demand and zone retests; displacement; fresh/partial/full FVG mitigation in both directions; premium/discount; breakout failure/retest; all four directional continuation/reversal outputs; waiting, conflict, invalid and insufficient states; complete calendar history; prepared multi-timeframe reuse; and a real-engine integration test proving three default candle datasets.

18. **Tests passed.** **124 tests in 20 files.** Command from `apps/web`: `npx vitest run --configLoader native --pool threads --maxWorkers 1`. Existing provider, cache, journal, application and entitlement regressions remain in the suite. The native config loader and thread pool work within this Windows environment.

19. **Tests failed.** **None in the final run.** Old expectations for full-universe scanning and weekend shutdown were updated to assert bounded discovery and crypto availability. A fixture that had already broken its reference level was corrected when the consumed-level guard exposed it; the production guard was retained.

20. **TypeScript.** `npx tsc --noEmit` passed independently. The multi-timeframe profile now uses required CandleInterval types rather than inheriting an optional parameter type.

21. **Lint.** `npm run lint` passed with zero errors and four existing unused-variable warnings in session-manager, decision-engine, the legacy liquidity analyzer and Supabase middleware. New/modified APA code introduces no lint warnings. Those unrelated warnings were left out of this refactor.

22. **Production build.** `npm run build` reached “Compiled successfully” (33.8 seconds), then failed at the TypeScript worker with `spawn EPERM`. A multiple-lockfile/root-inference warning also remains. This is **not a successful full production build**. Re-run the normal command in an unrestricted local terminal and complete route generation before release; standalone type checking does not replace that final gate.

23. **Diff and repository review.** `git diff HEAD --check` passes under the repository's normal Windows line-ending configuration. Git prints LF/CRLF conversion notices. Full staged-plus-unstaged changes were inspected, and no environment files, secret values, dependency manifests or lockfiles were changed. No debug logging or duplicate APA scoring service was introduced. An unrelated empty untracked file at `apps/web/apps/web/lib/profiles/profile-repository.ts` was discovered and left untouched.

24. **Performance.** Default selected-market analysis loads H4, H1 and M15 once each, rather than refetching H4/execution data for every detector. Two pivot scales intentionally represent different structural orders. Additional FVG reasoning uses existing datasets and no provider requests. Admission control defaults to eight credits per rolling minute, two concurrent requests and a bounded queue. Set `TWELVE_DATA_CREDITS_PER_MINUTE` and `TWELVE_DATA_CONCURRENCY` to verified account limits. These are server-side configuration names, not hardcoded account values. Provider 429s trigger a 60-second cooldown; subsequent callers may retry after it. There is no eager retry loop.

25. **Provider limitations.** Credit accounting is per instrument, including batch requests. The budget and caches are process-local and do not coordinate multiple server instances, other applications using the same API key or account daily limits. Paid-account access, exchange entitlements and live responses for every new symbol were not verified by making paid data calls in this phase. Provider failures remain visible rather than generating fallback prices.

26. **Market-data limitations.** OHLC alone cannot establish order flow, intentions, stop ownership, actual institutional participation, reliable volume, funding or open interest. UTC calendar references are not broker-session references. Incomplete history, market closures or missing bars can make day/week levels unavailable. Named exchange sessions need verified calendars/DST handling. The existing Forex/metals calendar remains a baseline schedule, not a comprehensive holiday/broker calendar.

27. **Technical debt.** The legacy institutional structure/MSS representation and separate liquidity ladder remain to avoid a broad risky migration. They should eventually consume the shared context through a reviewed adapter. Process-local cache/budget storage needs a shared implementation before horizontal scaling. Scanner ranking describes the observed subset, not every market at once. Legacy onboarding plan/session metadata should be retired when its consumers migrate to trusted billing/calendar APIs.

28. **Known limitations.** Browser inspection could not start: the connector twice returned “Unable to load browser request-header policy.” No new desktop/mobile screenshots or authenticated end-to-end claims are made. Strict confirmation and stale-history rules intentionally produce waiting/unavailable states. Technical “confirmed setup” is not execution readiness, a trade instruction or a win probability. Thresholds are deterministic heuristics covered by tests, not statistically calibrated strategy performance.

29. **Recommended next phase.** Finish the full local build and authenticated browser smoke tests, including Journal capture and mobile layouts. Verify provider account coverage and exchange calendars. Then add recorded-data replay/walk-forward validation, shared quota/cache storage and observability before enabling index feeds or increasing scan breadth. Cross-market correlation requires aligned reliable histories and remains a later phase.

30. **Intentionally deferred.** Index activation, session-specific levels/DST calendars, a new MSS taxonomy, named strong-swing taxonomy beyond causally protected references, nested-zone scoring and separate continuation/reversal zone taxonomy, accumulation/distribution or inducement claims, speculative correlation, portfolio intelligence, distributed scheduling and multi-provider failover. These either need verified data, quantitative validation, a migration of existing representations, or are future preparation rather than safe additions to this phase. No extra Daily/M5 requests are made solely to populate UI fields; those intervals work when explicitly chosen as required profile frames. Optional absent frames do not become invented evidence.

The implementation advances the requested core phase while retaining explicit data and release-verification limits. It should not be described as every possible APA concept being fully implemented or production-certified.

## File inventory

Paths below include this phase's tracked modifications and new source/test/document files. The unrelated empty nested profile file is excluded.


- M: apps/web/app/(protected)/intelligence/page.tsx
- M: apps/web/app/(protected)/markets/page.tsx
- M: apps/web/components/intelligence/market-browser.tsx
- A: apps/web/components/intelligence/price-action-card.tsx
- M: apps/web/lib/ai/intelligence/prompt-builder.ts
- M: apps/web/lib/analysis-cache/analysis-cache-service.ts
- M: apps/web/lib/application/intelligence/load-market-intelligence.test.ts
- M: apps/web/lib/application/intelligence/load-market-intelligence.ts
- M: apps/web/lib/application/intelligence/load-protected-market-intelligence.ts
- M: apps/web/lib/application/market/load-market-pulse.test.ts
- M: apps/web/lib/application/market/load-market-pulse.ts
- M: apps/web/lib/application/markets/load-markets.ts
- A: apps/web/lib/billing/market-access.ts
- M: apps/web/lib/execution-readiness/execution-readiness-analyzer.ts
- M: apps/web/lib/imbalance/imbalance-analyzer.ts
- A: apps/web/lib/institutional-setup/analysis-context.ts
- M: apps/web/lib/institutional-setup/institutional-setup-engine.ts
- M: apps/web/lib/institutional-setup/institutional-setup-service.ts
- M: apps/web/lib/institutional-setup/institutional-setup-types.ts
- M: apps/web/lib/institutional/confluence/confluence-engine.ts
- M: apps/web/lib/institutional/displacement/displacement-engine.ts
- M: apps/web/lib/institutional/liquidity/liquidity-engine.ts
- M: apps/web/lib/institutional/liquidity/liquidity-types.ts
- M: apps/web/lib/market-scanner/market-scanner-service.ts
- A: apps/web/lib/market-scanner/scan-schedule.ts
- M: apps/web/lib/market-session/market-availability-service.ts
- M: apps/web/lib/market-structure/market-structure-analyzer.ts
- M: apps/web/lib/market-structure/market-structure-types.ts
- M: apps/web/lib/market/market-service.ts
- M: apps/web/lib/market/market-universe.ts
- M: apps/web/lib/markets/registry.ts
- M: apps/web/lib/multi-timeframe/multi-timeframe-analyzer.ts
- M: apps/web/lib/multi-timeframe/multi-timeframe-types.ts
- A: apps/web/lib/price-action/breakout-quality.ts
- A: apps/web/lib/price-action/candle-context.ts
- A: apps/web/lib/price-action/price-action-engine.ts
- A: apps/web/lib/price-action/price-action-types.ts
- A: apps/web/lib/price-action/price-zones.ts
- A: apps/web/lib/providers/market-data/request-budget.ts
- M: apps/web/lib/providers/market-data/twelve-data-provider.ts
- M: apps/web/lib/repositories/market/market-repository.ts
- A: docs/apa-architecture-assessment.md
- New: apps/web/lib/institutional-setup/analysis-context.test.ts
- New: apps/web/lib/market/market-universe.apa.test.ts
- New: apps/web/lib/price-action/detectors.test.ts
- New: apps/web/lib/price-action/price-action-engine.test.ts
- New: apps/web/lib/price-action/reference-levels.test.ts
- New: apps/web/lib/price-action/reference-levels.ts
- New: apps/web/lib/providers/market-data/request-budget.test.ts
- New: apps/web/lib/providers/market-data/twelve-data-provider.apa.test.ts
- New: apps/web/lib/repositories/market/market-repository.apa.test.ts
- New: apps/web/lib/testing/ohlc-fixture.ts
- New: docs/apa-implementation-report.md
