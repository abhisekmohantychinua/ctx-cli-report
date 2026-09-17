import "./style.css";
import "iconify-icon";

import { loadContext } from "./data/loader";
import { HSStaticMethods } from "preline/non-auto";
import { bootstrapTheming } from "./theme";

async function main() {
  await loadContext();
  console.log("Loaded CTX context...");
}

main().catch(console.error);

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM content loaded...");

  bootstrapTheming();
  HSStaticMethods.autoInit();
});
