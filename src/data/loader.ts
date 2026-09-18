import type { RawReportData } from "./models/raw";

/**
 * Loads the raw CTX report payload from the public runtime asset.
 *
 * @returns The unprocessed report data used by the data pipeline.
 * @throws If the asset cannot be fetched successfully.
 */
export async function loadContext(): Promise<RawReportData> {
  const response = await fetch("/ctx.json");

  if (!response.ok) {
    throw new Error(`Failed to load ctx.json: ${response.status}`);
  }

  return (await response.json()) as RawReportData;
}
