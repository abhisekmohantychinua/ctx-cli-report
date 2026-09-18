import "./style.css";
import "iconify-icon";

import { HSStaticMethods } from "preline/non-auto";

import { bootstrapData } from "./data";
import { bootstrapTheming } from "./theme";

/**
 * Bootstraps the CTX CLI Report application.
 *
 * Application startup consists of two phases:
 *
 * 1. Load and process the report data.
 * 2. Initialize client-side UI after the DOM is ready.
 *
 * Any initialization error is propagated to the application entry point.
 *
 * @returns A promise that resolves after startup registration.
 */
async function bootstrapApplication(): Promise<void> {
  const report = await bootstrapData();

  console.log("Loaded CTX report data...", report);

  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM content loaded...");

    bootstrapTheming();
    HSStaticMethods.autoInit();

    // Rendering is deferred until the report page components are implemented.
    // TODO: Render report pages using `report`.
  });
}

bootstrapApplication().catch((error: unknown) => {
  console.error("Failed to initialize application.", error);
});
