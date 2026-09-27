import { loadContext } from "./loader";
import type { ReportData } from "./models/report-data";
import { processSourceData } from "./processor";

/**
 * Loads the CTX project context and processes it into report data.
 *
 * This is the public entry point for the report data pipeline.
 *
 * @returns A page-oriented report model ready for UI rendering.
 */
export async function bootstrapData(): Promise<ReportData> {
  const sourceData = await loadContext();
  const reportData = processSourceData(sourceData);
  return reportData;
}
