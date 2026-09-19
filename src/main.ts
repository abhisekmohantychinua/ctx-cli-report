import "./style.css";
import "iconify-icon";

import { HSStaticMethods } from "preline/non-auto";

import { bootstrapData } from "./data";
import { bootstrapTheming } from "./theme";
import { bootstrapBinding } from "./binding";

/**
 * Waits until the document is ready for client-side initialization.
 *
 * If the DOM is still loading, this resolves when `DOMContentLoaded` fires.
 * Otherwise, it resolves immediately.
 *
 * @returns A promise that resolves when the DOM is ready.
 */
function onDomReady(): Promise<void> {
  if (document.readyState === "loading") {
    return new Promise((resolve) => {
      document.addEventListener("DOMContentLoaded", () => resolve(), {
        once: true,
      });
    });
  }

  return Promise.resolve();
}

/**
 * Bootstraps the CTX CLI Report application.
 *
 * Application startup requires both the report data and the DOM to be ready.
 * These prerequisites are initialized independently and then client-side
 * application features are initialized once both are available.
 *
 * @returns A promise that resolves after application startup.
 */
async function bootstrapApplication(): Promise<void> {
  const [reportData] = await Promise.all([bootstrapData(), onDomReady()]);

  console.log("Loaded CTX report data...", reportData);

  bootstrapTheming();
  bootstrapBinding(reportData);
  HSStaticMethods.autoInit();
}

bootstrapApplication().catch((error: unknown) => {
  console.error("Failed to initialize application.", error);
});
