import { Card, CardContent } from "@/components/ui/card";
import type { BadOrderRisk } from "../../types";
import { InfoHint } from "./InfoHint";
import { RiskGauge } from "./RiskGauge";
import { RiskIcon } from "./RiskIcon";

// Plain-words summary of the APQC Open Standards Benchmarking perfect order
// index: median companies ship ~10% flawed orders, top quartile 5% or less.
const BAD_ORDER_RISK_HINT =
  "Based on APQC benchmarking research: a typical company has about 10% of orders go wrong, while top performers stay at 5% or less.";

export function BadOrderRiskCard({
  risk,
  ratePct,
}: {
  risk: BadOrderRisk;
  ratePct: number;
}) {
  return (
    <Card className="border-border/70 shadow-soft dark:shadow-soft-dark">
      <CardContent className="p-5">
        <div className="flex items-center gap-1.5">
          <p className="text-[13px] font-medium text-muted-foreground">
            Bad order risk level this month
          </p>
          <InfoHint
            label="How the risk level is set"
            hint={BAD_ORDER_RISK_HINT}
          />
        </div>
        <div className="mt-3 flex items-center gap-2.5">
          <p className="text-[28px] font-semibold leading-none tracking-tight">
            {risk.label}
          </p>
          <RiskIcon risk={risk} />
        </div>
        <p className="mt-2.5 text-xs text-muted-foreground">
          Bad order rate {ratePct.toFixed(1)}% this month
        </p>
        <RiskGauge ratePct={ratePct} />
      </CardContent>
    </Card>
  );
}
