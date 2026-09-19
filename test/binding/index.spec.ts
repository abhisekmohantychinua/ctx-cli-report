import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ReportData } from "../../src/data/models/report";
import { bootstrapBinding } from "../../src/binding";
import { bindInitializer } from "../../src/binding/initializer-binder";
import { bindKey } from "../../src/binding/key-binder";

vi.mock("../../src/binding/key-binder", () => ({
  bindKey: vi.fn(),
}));

vi.mock("../../src/binding/initializer-binder", () => ({
  bindInitializer: vi.fn(),
}));

describe("binding", () => {
  const reportData = {} as ReportData;

  beforeEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("binds all elements containing data-key", () => {
    document.body.innerHTML = `
      <span data-key="metadata.project.name"></span>
      <span data-key="metadata.generatedAt"></span>
    `;

    bootstrapBinding(reportData);

    const elements = document.querySelectorAll<HTMLElement>("[data-key]");

    expect(bindKey).toHaveBeenCalledTimes(2);
    expect(bindKey).toHaveBeenNthCalledWith(
      1,
      reportData,
      "metadata.project.name",
      elements[0],
    );
    expect(bindKey).toHaveBeenNthCalledWith(
      2,
      reportData,
      "metadata.generatedAt",
      elements[1],
    );
  });

  it("binds all elements containing data-initializer", () => {
    document.body.innerHTML = `
      <div data-initializer="recent-activity"></div>
      <div data-initializer="session-chart"></div>
    `;

    bootstrapBinding(reportData);

    const elements =
      document.querySelectorAll<HTMLElement>("[data-initializer]");

    expect(bindInitializer).toHaveBeenCalledTimes(2);
    expect(bindInitializer).toHaveBeenNthCalledWith(
      1,
      reportData,
      "recent-activity",
      elements[0],
    );
    expect(bindInitializer).toHaveBeenNthCalledWith(
      2,
      reportData,
      "session-chart",
      elements[1],
    );
  });

  it("binds both keys and initializers", () => {
    document.body.innerHTML = `
      <span data-key="metadata.project.name"></span>
      <div data-initializer="recent-activity"></div>
    `;

    bootstrapBinding(reportData);

    expect(bindKey).toHaveBeenCalledTimes(1);
    expect(bindInitializer).toHaveBeenCalledTimes(1);
  });

  it("ignores elements without a binding key", () => {
    document.body.innerHTML = `
      <span data-key></span>
      <span data-key=""></span>
    `;

    bootstrapBinding(reportData);

    expect(bindKey).not.toHaveBeenCalled();
  });

  it("ignores elements without an initializer key", () => {
    document.body.innerHTML = `
      <div data-initializer></div>
      <div data-initializer=""></div>
    `;

    bootstrapBinding(reportData);

    expect(bindInitializer).not.toHaveBeenCalled();
  });
});
