import { describe, expect, it } from "vitest";

import type { ReportData } from "../../src/data/models/report";
import { bindInitializer } from "../../src/binding/initializer-binder";

describe("binding/initializer-binder", () => {
  const reportData = {} as ReportData;

  it("throws when the initializer is not defined", () => {
    const element = document.createElement("div");

    expect(() => {
      bindInitializer(reportData, "unknown", element);
    }).toThrow("Initializer not defined: unknown");
  });
});
