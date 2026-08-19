import { isWifiConnected } from "@/src/lib/network";
import { downloadRoutes } from "./routes";
import { downloadProvinces } from "./provinces";
import { downloadAgentStoresAndLinks } from "./stores-and-links";
import { downloadSessions } from "./sessions";

export type DownloadResult = {
  routes: number;
  provinces: number;
  stores: number;
  sessions: number;
};

/**
 * Manual pull of agent-owned reference data, behind the Settings download
 * button. Same FK-safe order as the automatic sync but noisier: it throws
 * messages meant to be shown to the agent instead of only logging, since
 * someone is standing there waiting for a result.
 *
 * @returns How many rows landed per table.
 * @throws If there is no wifi, or if routes fail — provinces and stores
 *         reference routes by FK, so there is no point continuing.
 */
export async function downloadReferenceData(): Promise<DownloadResult> {
  if (!(await isWifiConnected())) {
    throw new Error(
      "No wifi connection. Connect to the internet and try again.",
    );
  }

  const routes = await downloadRoutes();
  if (routes === null)
    throw new Error(
      "Failed to download routes. Check your connection and try again.",
    );
  const provinces = await downloadProvinces();
  const stores = await downloadAgentStoresAndLinks();
  const sessions = await downloadSessions();

  return {
    routes,
    provinces: provinces ?? 0,
    stores: stores ?? 0,
    sessions: sessions ?? 0,
  };
}
