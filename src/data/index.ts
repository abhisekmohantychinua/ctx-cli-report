import { loadContext } from "./loader";
import { processReport } from "./processor";
import type { ReportData } from "./models/report";

/**
 * Loads the CTX project context and processes it into report data.
 *
 * This is the public entry point for the report data pipeline.
 *
 * @returns A page-oriented report model ready for UI rendering.
 */
export async function bootstrapData(): Promise<ReportData> {
  const rawData = await loadContext();
  return processReport(rawData);
}
