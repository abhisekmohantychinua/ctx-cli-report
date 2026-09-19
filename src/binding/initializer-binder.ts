import type { ReportData } from "../data/models/report";

type Initializer = (reportData: ReportData, element: HTMLElement) => void;

/**
 * Binds a report initializer to a DOM element.
 *
 * @param reportData - Processed report data.
 * @param key - Initializer key to execute.
 * @param element - Target DOM element.
 */
export function bindInitializer(
  reportData: ReportData,
  key: string,
  element: HTMLElement,
): void {
  const initializer = getInitializer(key);

  initializer(reportData, element);
}

/**
 * Retrieves an initializer by its key.
 *
 * @param key - Initializer key to retrieve.
 * @returns The initializer associated with the key.
 * @throws If the requested initializer is not defined.
 */
function getInitializer(key: string): Initializer {
  switch (key) {
    default:
      throw new Error(`Initializer not defined: ${key}`);
  }
}
