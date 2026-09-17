import "./style.css";
import { HSStaticMethods } from "preline/non-auto";

import { loadContext } from "./data/loader";

async function main() {
  const context = await loadContext();

  console.log("Loaded CTX context:", context);
}

main().catch(console.error);

document.addEventListener("DOMContentLoaded", () => {
  HSStaticMethods.autoInit();
});
