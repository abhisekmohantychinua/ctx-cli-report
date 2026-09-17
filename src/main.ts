import "./style.css";
import "./theme";

import { loadContext } from "./data/loader";
import { HSStaticMethods } from "preline/non-auto";

async function main() {
  await loadContext();
  console.log("Loaded CTX context...");
}

main().catch(console.error);

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM content loaded...");
  HSStaticMethods.autoInit();
});
