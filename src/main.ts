import "./style.css";

import { loadContext } from "./data/loader";

async function main() {
  const context = await loadContext();

  console.log("Loaded CTX context:", context);
}

main().catch(console.error);
