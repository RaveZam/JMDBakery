import { useContext } from "react";
import { RouteDetailContext } from "./RouteDetailContext";

export function useRouteDetail() {
  const ctx = useContext(RouteDetailContext);
  if (!ctx) {
    throw new Error("useRouteDetail must be used within a RouteDetailProvider");
  }
  return ctx;
}
