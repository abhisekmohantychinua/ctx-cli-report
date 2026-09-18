import "./style.css";
import "iconify-icon";

import { HSStaticMethods } from "preline/non-auto";

import { bootstrapData } from "./data";
import { bootstrapTheming } from "./theme";

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
  const [report] = await Promise.all([bootstrapData(), onDomReady()]);

  console.log("Loaded CTX report data...", report);

  bootstrapTheming();
  HSStaticMethods.autoInit();

  // Rendering is deferred until the report page components are implemented.
  // TODO: Render report pages using `report`.
}

bootstrapApplication().catch((error: unknown) => {
  console.error("Failed to initialize application.", error);
});
