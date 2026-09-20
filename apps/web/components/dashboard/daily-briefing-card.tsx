import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DailyBriefingCardProps {
  focusScore:
    | number
    | null;

  marketSummary: string;

  mission: string;

  opportunity: string;

  risk: string;

  growth: string;
}

export function DailyBriefingCard({
  focusScore,
  marketSummary,
  mission,
  opportunity,
  risk,
  growth,
}: DailyBriefingCardProps) {
  return (
    <Card className="border-slate-800 bg-slate-900">
      <CardHeader className="space-y-3">
        <div>
          <CardTitle className="text-2xl font-bold">
            Today&apos;s Intelligence Brief
          </CardTitle>

          <p className="mt-2 text-sm text-slate-400">
            Personalized market insights based on
            current market conditions and your
            trading profile.
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-400">
            Today&apos;s Focus Score
          </p>

          <p className="text-5xl font-bold text-blue-500">
            {focusScore ?? "—"}
          </p>

          {focusScore === null && (
            <p className="mt-1 text-sm text-slate-500">
              No active market score
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <section>
          <h3 className="font-semibold text-white">
            Market Summary
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            {marketSummary}
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-white">
            Today&apos;s Mission
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            {mission}
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-white">
            Best Opportunity
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            {opportunity}
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-white">
            Risk Alert
          </h3>

          <p className="mt-1 text-sm text-amber-400">
            {risk}
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-white">
            Growth Insight
          </h3>

          <p className="mt-1 text-sm text-emerald-400">
            {growth}
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
