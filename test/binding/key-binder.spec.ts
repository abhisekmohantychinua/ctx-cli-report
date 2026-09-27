import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import type { Data } from "../../src/data/models/data";
import { bindKey } from "../../src/binding/key-binder";

describe("binding/key-binder", () => {
  const generatedAt = DateTime.fromISO("2026-09-19T07:30:00.000Z", {
    setZone: true,
  });

  const dateTimeTemplate = "dd-LLL-yyyy hh:mm a";
  const timeZone = "Asia/Kolkata";

  const data = {
    metadata: {
      project: {
        name: "CTX CLI",
        dateTimeTemplate,
        timezone: timeZone,
      },
      generatedAt,
    },
  } as Data;

  it("binds the project name", () => {
    const element = document.createElement("span");

    bindKey(data, "metadata.project.name", element);

    expect(element.textContent).toBe("CTX CLI");
  });

  it("binds the generated date using the report date-time template and timezone", () => {
    const element = document.createElement("span");

    bindKey(data, "metadata.generatedAt", element);

    expect(element.textContent).toBe(
      generatedAt.setZone(timeZone).toFormat(dateTimeTemplate),
    );
  });

  it("replaces existing element content", () => {
    const element = document.createElement("span");
    element.textContent = "Previous value";

    bindKey(data, "metadata.project.name", element);

    expect(element.textContent).toBe("CTX CLI");
  });

  it("throws when the key is not defined", () => {
    const element = document.createElement("span");

    expect(() => {
      bindKey(data, "metadata.unknown", element);
    }).toThrow("Key not defined: metadata.unknown");
  });
});
