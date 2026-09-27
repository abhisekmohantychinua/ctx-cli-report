import { describe, expect, it } from "vitest";

import type { ReportData } from "../../src/data/models/report-data";
import { bindInitializer } from "../../src/binding/initializer-binder";

describe("binding/initializer-binder", () => {
  const data = {} as ReportData;

  it("throws when the initializer is not defined", () => {
    const element = document.createElement("div");

    expect(() => {
      bindInitializer(data, "unknown", element);
    }).toThrow("Initializer not defined: unknown");
  });
});
