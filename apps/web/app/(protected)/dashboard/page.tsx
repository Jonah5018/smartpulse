import { DashboardShell } from "@/components/layout/dashboard-shell";

import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { DailyBriefingCard } from "@/components/dashboard/daily-briefing-card";
import { FocusScoreCard } from "@/components/dashboard/focus-score-card";
import { MarketPulseCard } from "@/components/dashboard/market-pulse-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { MarketStatusCard } from "@/components/dashboard/market-status-card";

import { LoadDashboard } from "@/lib/application";
import { MarketsToWatchCard } from "@/components/dashboard/markets-to-watch-card";
import { DecisionCard } from "@/components/dashboard/decision-card";

export default async function DashboardPage() {
  const {
    workspace,
    market,
    briefing,
  } = await LoadDashboard.execute();

  const topFocus =
    market.topFocus;

  const bestOpportunity =
    topFocus?.symbol ??
    market.quotes[0]?.symbol ??
    "N/A";

  return (
    <DashboardShell
      profile={workspace.profile}
    >
      <div className="space-y-8">
        <DashboardHero
          profile={workspace.profile}
        />

        <FocusScoreCard
          focus={topFocus}
        />
        <DecisionCard
          symbol={
            topFocus?.symbol ??
            "Primary Market"
       }
        decision={
          topFocus
            ? market.decisions[
                topFocus.symbol
            ]
            : undefined
        }
        />
        <MarketsToWatchCard
          focusScores={market.focusScores}
        />

        <DailyBriefingCard
          focusScore={
            briefing.focusScore
          }
          marketSummary={
            briefing.marketSummary.content
          }
          mission={
            briefing.mission.content
          }
          opportunity={
            briefing.opportunity.content
          }
          risk={
            briefing.risk.content
          }
          growth={
            briefing.growth.content
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MarketPulseCard
              pulse={market.pulse}
            />
          </div>

          <MarketStatusCard
            marketStatus={
              market.session.isOpen
                ? "Global Markets Open"
                : "Global Markets Closed"
            }
            tradingDay={
              market.session.isOpen
            }
            holiday={false}
            earlyClose={false}
            closeTime={null}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <MetricCard
            title="Best Opportunity"
            value={
              bestOpportunity
            }
            subtitle={
              topFocus
                ? `${topFocus.score}/100 Focus Score`
                : "No focus market"
            }
          />

          <MetricCard
            title="Market Bias"
            value={
              market.pulse.trend
            }
            subtitle={
              market.pulse.summary
            }
          />

          <MetricCard
            title="Market Session"
            value={
              market.session.current
            }
            subtitle={
              market.session.description
            }
          />
        </div>
      </div>
    </DashboardShell>
  );
}