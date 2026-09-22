import type { ProductionRecommendation } from "../helpers/computeProductionRecommendations";

export function ProductionRecommendationRow({
  rec,
}: {
  rec: ProductionRecommendation;
}) {
  return (
    <tr className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/40">
      <td className="px-5 py-3.5 font-sans text-sm font-medium">
        {rec.product}
      </td>
      <td className="px-5 py-3.5 text-right text-muted-foreground">
        {rec.totalSold.toLocaleString()}
      </td>
      <td className="px-5 py-3.5 text-right text-muted-foreground">
        {rec.avgSoldPerDay.toFixed(1)}
      </td>
      <td className="px-5 py-3.5 text-right">
        {rec.avgBadOrderPerDay > 0 ? (
          <span className="inline-flex items-center gap-1.5 font-semibold text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
            {rec.avgBadOrderPerDay.toFixed(1)}
          </span>
        ) : (
          <span className="text-muted-foreground">0.0</span>
        )}
      </td>
      <td className="px-5 py-3.5 text-right">
        <span className="inline-flex items-baseline gap-1.5 rounded-md bg-accent px-2.5 py-1 text-accent-foreground">
          <span className="text-base font-semibold">{rec.recommended}</span>
          <span className="font-sans text-xs">units</span>
        </span>
      </td>
    </tr>
  );
}
