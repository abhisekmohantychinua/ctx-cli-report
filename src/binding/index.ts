import type { Data } from "../data/models/data";
import { bindInitializer } from "./initializer-binder";
import { bindKey } from "./key-binder";

/**
 * Initializes report data bindings in the current document.
 *
 * @param reportData - Processed report data.
 */
export function bootstrapBinding(reportData: Data): void {
  bindKeys(reportData);
  bindInitializers(reportData);
}

/**
 * Binds all elements containing a report data key.
 *
 * @param reportData - Processed report data.
 */
function bindKeys(reportData: Data): void {
  const elements = document.querySelectorAll<HTMLElement>("[data-key]");

  elements.forEach((element) => {
    const key = element.dataset.key;

    if (!key) {
      return;
    }

    bindKey(reportData, key, element);
  });
}

/**
 * Binds all elements containing an initializer key.
 *
 * @param reportData - Processed report data.
 */
function bindInitializers(reportData: Data): void {
  const elements = document.querySelectorAll<HTMLElement>("[data-initializer]");

  elements.forEach((element) => {
    const key = element.dataset.initializer;

    if (!key) {
      return;
    }

    bindInitializer(reportData, key, element);
  });
}
