import { InstitutionalSetupService } from "@/lib/institutional-setup";
import { OpportunityService } from "@/lib/opportunity";
import { FocusScoreService } from "@/lib/focus-score";
import { DecisionService } from "@/lib/decision";
import { MarketSessionService } from "@/lib/market-session";
import { MarketAvailabilityService } from "@/lib/market-session/market-availability-service";
import { getActiveMarketSymbols } from "@/lib/market/market-universe";
import { MarketSelectionService } from "@/lib/market-selection";
import { AIIntelligenceService } from "@/lib/ai/intelligence";
import { AnalysisCacheService, type AnalysisSnapshot } from "@/lib/analysis-cache";
import { TradeJournalService } from "@/lib/trade-journal";
import { LoadMacroIntelligence } from "@/lib/application/macro/load-macro-intelligence";
import { LoadLiquidityIntelligence } from "@/lib/application/liquidity/load-liquidity-intelligence";
import { LoadConfluenceMatrix } from "@/lib/application/confluence/load-confluence-matrix";
import { MacroContextBuilder, type MacroAnalysisResult } from "@/lib/macro";
import { RegimeEngine, type RegimeAnalysis } from "@/lib/market-regime";
import type { LiquidityAnalysis } from "@/lib/liquidity";

export interface MarketIntelligenceResult {
  symbol: string;
  session: ReturnType<typeof MarketSessionService.current>;
  generatedAt: string | null;
  setup: AnalysisSnapshot["setup"] | null;
  opportunity: AnalysisSnapshot["opportunity"] | null;
  focus: AnalysisSnapshot["focus"];
  decision: AnalysisSnapshot["decision"] | null;
  tradeJournal: AnalysisSnapshot["tradeJournal"] | null;
  marketSelection: ReturnType<typeof MarketSelectionService.select> | null;
  aiBrief: string | null;
  macroAnalysis: MacroAnalysisResult | null;
  liquidityAnalysis: LiquidityAnalysis | null;
  regime: RegimeAnalysis | null;
  confluence: ReturnType<typeof LoadConfluenceMatrix.execute> | null;
  unavailableSections: string[];
  marketClosed: boolean;
  marketAvailability: ReturnType<typeof MarketAvailabilityService.current>;
}

export class LoadMarketIntelligence {
  static async execute(
    symbol: string,
    watchlist: string[] = []
  ): Promise<MarketIntelligenceResult> {
    const normalizedSymbol = symbol.trim().toUpperCase();
    const session = MarketSessionService.current();
    const availability = MarketAvailabilityService.current(normalizedSymbol);
    const result: MarketIntelligenceResult = {
      symbol: normalizedSymbol,
      session,
      generatedAt: null,
      setup: null,
      opportunity: null,
      focus: null,
      decision: null,
      tradeJournal: null,
      marketSelection: null,
      aiBrief: null,
      macroAnalysis: null,
      liquidityAnalysis: null,
      regime: null,
      confluence: null,
      unavailableSections: [],
      marketClosed: !availability.isOpen,
      marketAvailability: availability,
    };

    // Study snapshots have a separate lifetime from live analysis. Check the
    // market calendar before consulting either cache or requesting providers.
    if (!availability.isOpen) {
      const snapshot = AnalysisCacheService.get(normalizedSymbol);
      return snapshot ? { ...result, ...snapshot } : result;
    }

    if (!getActiveMarketSymbols().includes(normalizedSymbol)) {
      return result;
    }

    // Give the inspected market priority over discovery requests. A failure
    // here belongs to this market; never silently substitute another symbol.
    const requested = await this.analyze(normalizedSymbol);
    Object.assign(result, requested);
    if (!requested.focus) result.unavailableSections.push("Focus score");

    const discoverySymbols = getActiveMarketSymbols().filter(
      (candidate) => candidate !== normalizedSymbol &&
        MarketAvailabilityService.current(candidate).isOpen
    );

    const [discovery] = await Promise.all([
      Promise.allSettled(discoverySymbols.map((candidate) => this.analyze(candidate))),
      this.loadContext(result, requested),
    ]);

    const opportunities = { [normalizedSymbol]: requested.opportunity };
    for (const entry of discovery) {
      if (entry.status === "fulfilled") {
        opportunities[entry.value.symbol] = entry.value.opportunity;
      }
    }
    if (discovery.some((entry) => entry.status === "rejected")) {
      result.unavailableSections.push("Some market rankings");
    }

    // Watchlist preferences are request-specific and must never be saved in
    // the shared market snapshot or discarded on a cache hit.
    result.marketSelection = MarketSelectionService.select(watchlist, opportunities);
    return result;
  }

  private static async analyze(symbol: string): Promise<AnalysisSnapshot> {
    const cached = AnalysisCacheService.getLive(symbol);
    if (cached) return cached;

    const setup = await InstitutionalSetupService.current(symbol, "15min", 200);
    const opportunity = OpportunityService.fromInstitutionalSetup(setup);
    const focus = await FocusScoreService.fromOpportunity(opportunity).catch(() => {
      console.warn("Focus score unavailable for %s: calendar data could not be loaded.", symbol);
      return null;
    });
    const snapshot: AnalysisSnapshot = {
      symbol: setup.symbol,
      generatedAt: new Date().toISOString(),
      setup,
      opportunity,
      focus,
      decision: DecisionService.evaluate(setup),
      tradeJournal: TradeJournalService.fromInstitutionalSetup(setup),
    };
    AnalysisCacheService.save(snapshot);
    return snapshot;
  }

  private static async loadContext(
    result: MarketIntelligenceResult,
    snapshot: AnalysisSnapshot
  ): Promise<void> {
    const [macro, liquidity] = await Promise.allSettled([
      LoadMacroIntelligence.execute(),
      LoadLiquidityIntelligence.execute(snapshot.symbol, "15min"),
    ]);

    if (liquidity.status === "fulfilled") {
      result.liquidityAnalysis = liquidity.value;
    } else {
      result.unavailableSections.push("Liquidity ladder");
    }

    if (macro.status === "rejected") {
      result.unavailableSections.push("Macro context and AI brief");
      return;
    }

    // Reuse one macro result for the prompt, regime, and confluence matrix.
    result.macroAnalysis = macro.value;
    const macroContext = MacroContextBuilder.build(macro.value);
    result.regime = RegimeEngine.analyze(macroContext);
    if (snapshot.focus && result.liquidityAnalysis) {
      result.confluence = LoadConfluenceMatrix.execute(
        snapshot.focus, result.liquidityAnalysis, result.regime, macroContext
      );
    }

    result.aiBrief = await AIIntelligenceService.generateBrief(snapshot.setup, macro.value)
      .catch(() => {
        console.warn("AI brief unavailable for %s.", snapshot.symbol);
        return null;
      });
  }
}
