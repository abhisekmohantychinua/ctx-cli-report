import "./style.css";
import "iconify-icon";

import { loadContext } from "./data/loader";
import { HSStaticMethods } from "preline/non-auto";
import { bootstrapTheming } from "./theme";

/**
 * Initializes the application after the document has loaded.
 *
 * Registers a `DOMContentLoaded` listener that initializes the theme system
 * and automatically initializes Preline components.
 */
export function initializeApp(): void {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM content loaded...");

    bootstrapTheming();
    HSStaticMethods.autoInit();
  });
}

/**
 * Loads the CTX project context and reports successful loading.
 *
 * Any loading error is handled by the application entry point.
 */
async function main(): Promise<void> {
  await loadContext();
  console.log("Loaded CTX context...");
}

main().catch(console.error);

initializeApp();
