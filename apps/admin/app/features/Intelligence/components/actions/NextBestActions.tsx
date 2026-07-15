import { IntelligenceActionCard } from "./IntelligenceActionCard";
import { NEXT_BEST_ACTIONS } from "../../constants/nextBestActions";

export function NextBestActions() {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Next best actions</h2>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
        {NEXT_BEST_ACTIONS.map((action) => (
          <IntelligenceActionCard key={action.id} action={action} />
        ))}
      </div>
    </section>
  );
}
