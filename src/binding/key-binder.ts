import type { ReportData } from "../data/models/report-data";

/**
 * Binds a report value to a DOM element.
 *
 * @param data - Processed report data.
 * @param key - Report data key to bind.
 * @param element - Target DOM element.
 */
export function bindKey(
  data: ReportData,
  key: string,
  element: HTMLElement,
): void {
  element.textContent = getValueOfKey(data, key);
}

/**
 * Retrieves the value of a report data key.
 * @param data - Processed report data.
 * @param key - Report data key to retrieve.
 * @returns The value of the report data key.
 */
function getValueOfKey(data: ReportData, key: string): string {
  switch (key) {
    case "metadata.project.name":
      return data.metadata.project.name;
    case "metadata.generatedAt":
      return data.metadata.generatedAt
        .setZone(data.metadata.project.timezone)
        .toFormat(data.metadata.project.dateTimeTemplate);
    default:
      throw new Error("Key not defined: " + key);
  }
}
