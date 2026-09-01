import { Redirect } from "expo-router";
import { useOngoingSession } from "@/src/features/sessions/hooks/useOngoingSession";

export default function Index(): React.JSX.Element {
  const ongoing = useOngoingSession();

  if (!ongoing) return <Redirect href="/main/routes" />;

  // A route already underway owns the app: pick up where the agent left off,
  // at morning inventory or on the route itself.
  return (
    <Redirect
      href={{
        pathname: ongoing.morning_inventory_finished
          ? "/main/routes/session"
          : "/main/routes/inventory",
        params: { sessionId: ongoing.id, routeName: ongoing.route_name },
      }}
    />
  );
}
