import { loadContext } from "./loader";
import type { Data } from "./models/data";
import { processReportData } from "./processor";

/**
 * Loads the CTX project context and processes it into report data.
 *
 * This is the public entry point for the report data pipeline.
 *
 * @returns A page-oriented report model ready for UI rendering.
 */
export async function bootstrapData(): Promise<Data> {
  const reportData = await loadContext();
  return processReportData(reportData);
}
