import { format } from "date-fns";
import type { ReportData } from "../data/models/report";
import { TZDate } from "@date-fns/tz";

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
      return formatDateTime(
        reportData.metadata.generatedAt,
        reportData.metadata.project.dateTimeTemplate,
        reportData.metadata.project.timezone,
      );
    default:
      throw new Error("Key not defined: " + key);
  }
}

/**
 * Formats an instant using a date-fns format template
 * in the specified IANA time zone.
 *
 * @param date - The instant to format.
 * @param template - The date-fns format template.
 * @param timeZone - The IANA time zone identifier.
 * @returns The formatted date-time string.
 */
export function formatDateTime(
  date: Date,
  template: string,
  timeZone: string,
): string {
  return format(new TZDate(date, timeZone), template);
}
