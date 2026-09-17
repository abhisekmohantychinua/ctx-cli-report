import { beforeEach, describe, expect, it, vi } from "vitest";

const bootstrapTheming = vi.fn();
const autoInit = vi.fn();

vi.mock("preline/non-auto", () => ({
  HSStaticMethods: {
    autoInit,
  },
}));

vi.mock("../src/theme", () => ({
  bootstrapTheming,
}));

describe("main entry point", async () => {
  await import("../src/main");

  beforeEach(() => {
    bootstrapTheming.mockReset();
    autoInit.mockReset();

    document.documentElement.className = "";
    document.body.innerHTML = "";
  });

  it("initializes theming and Preline after DOMContentLoaded", () => {
    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(bootstrapTheming).toHaveBeenCalledTimes(1);
    expect(autoInit).toHaveBeenCalledTimes(1);
  });

  it("initializes theming before Preline", () => {
    const initializationOrder: string[] = [];

    bootstrapTheming.mockImplementation(() => {
      initializationOrder.push("theme");
    });

    autoInit.mockImplementation(() => {
      initializationOrder.push("preline");
    });

    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(initializationOrder).toEqual(["theme", "preline"]);
  });
});
