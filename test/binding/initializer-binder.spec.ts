import { describe, expect, it } from "vitest";

import type { ReportData } from "../../src/data/models/report-data";
import { bindInitializer } from "../../src/binding/initializer-binder";

describe("binding/initializer-binder", () => {
  const data = {
    metadata: { project: { root: "/workspace/ctx" } },
    overview: { metrics: { tasks: 0 }, recentActivity: [], timeline: [] },
    tasks: { statusDistribution: [] },
  } as unknown as ReportData;

  it("renders an empty state for task status when there are no tasks", () => {
    const element = document.createElement("div");

    bindInitializer(data, "overview.task-status", element);

    expect(element).toHaveTextContent("No task data available.");
  });

  it("renders an empty state when there is no recent activity", () => {
    const element = document.createElement("div");

    bindInitializer(data, "overview.recent-activity", element);

    expect(element).toHaveTextContent("No recent activity.");
  });

  it("renders an empty state when there are no timeline events", () => {
    const element = document.createElement("div");

    bindInitializer(data, "overview.timeline", element);

    expect(element).toHaveTextContent("No timeline events available.");
  });

  it("sets the project root as the tooltip", () => {
    const element = document.createElement("div");

    bindInitializer(data, "overview.project.root.tooltip", element);

    expect(element.title).toBe("/workspace/ctx");
  });

  it("throws when the initializer is not defined", () => {
    const element = document.createElement("div");

    expect(() => {
      bindInitializer(data, "unknown", element);
    }).toThrow("Initializer not defined: unknown");
  });
});
