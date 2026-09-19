import type { ReportData } from "../data/models/report";

/**
 * Binds a report value to a DOM element.
 *
 * @param reportData - Processed report data.
 * @param key - Report data key to bind.
 * @param element - Target DOM element.
 */
export function bindKey(
  reportData: ReportData,
  key: string,
  element: HTMLElement,
): void {
  element.textContent = getValueOfKey(reportData, key);
}

/**
 * Retrieves the value of a report data key.
 * @param reportData - Processed report data.
 * @param key - Report data key to retrieve.
 * @returns The value of the report data key.
 */
function getValueOfKey(reportData: ReportData, key: string): string {
  switch (key) {
    case "metadata.project.name":
      return reportData.metadata.project.name;
    case "metadata.generatedAt":
      return reportData.metadata.generatedAt.toLocaleString("en-US", {
        timeZone: reportData.metadata.timezone,
      });
    default:
      throw new Error("Key not defined: " + key);
  }
}
