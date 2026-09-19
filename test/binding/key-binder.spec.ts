import { describe, expect, it } from "vitest";

import type { ReportData } from "../../src/data/models/report";
import { bindKey } from "../../src/binding/key-binder";

describe("binding/key-binder", () => {
  const generatedAt = new Date("2026-09-19T07:30:00.000Z");

  const reportData = {
    metadata: {
      project: {
        name: "CTX CLI",
      },
      generatedAt,
      timezone: "Asia/Kolkata",
    },
  } as ReportData;

  it("binds the project name", () => {
    const element = document.createElement("span");

    bindKey(reportData, "metadata.project.name", element);

    expect(element.textContent).toBe("CTX CLI");
  });

  it("binds the generated date using the report timezone", () => {
    const element = document.createElement("span");

    bindKey(reportData, "metadata.generatedAt", element);

    expect(element.textContent).toBe(
      generatedAt.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      }),
    );
  });

  it("replaces existing element content", () => {
    const element = document.createElement("span");
    element.textContent = "Previous value";

    bindKey(reportData, "metadata.project.name", element);

    expect(element.textContent).toBe("CTX CLI");
  });

  it("throws when the key is not defined", () => {
    const element = document.createElement("span");

    expect(() => {
      bindKey(reportData, "metadata.unknown", element);
    }).toThrow("Key not defined: metadata.unknown");
  });
});
