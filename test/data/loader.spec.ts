import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadContext } from "../../src/data/loader";
import type { RawReportData } from "../../src/data/models/raw";

describe("data/loader", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads the CTX report payload from /ctx.json", async () => {
    const rawData = {
      metadata: {
        project: {
          name: "example",
          root: "/projects/example",
          createdAt: "2026-09-01T10:00:00",
        },
        ctxVersion: "1.0.0",
        timezone: "Asia/Kolkata",
        dataRange: {
          firstActivity: "2026-09-01T10:00:00",
          lastActivity: "2026-09-01T12:00:00",
        },
      },
      sessions: {
        records: [],
        statistics: {
          count: 0,
          completedCount: 0,
          activeCount: 0,
          totalDuration: 0,
          averageDuration: 0,
          medianDuration: 0,
          longestDuration: 0,
          shortestDuration: 0,
        },
        durationDistribution: [],
        activity: {
          firstStart: "",
          latestEnd: "",
          calendarDays: 0,
          activeDays: 0,
          inactiveDays: 0,
          dailyCounts: [],
          dailyDurations: [],
          startByHour: [],
          startByDayOfWeek: [],
          averageStartTime: "",
          peakStartHour: 0,
        },
        gaps: {
          values: [],
          average: 0,
          median: 0,
          longest: 0,
          shortest: 0,
          distribution: [],
        },
      },
      tasks: {
        records: [],
        statistics: {
          count: 0,
          completedCount: 0,
          pendingCount: 0,
          inProgressCount: 0,
          blockedCount: 0,
          openCount: 0,
          rootCount: 0,
          subtaskCount: 0,
          maxDepth: 0,
          averageCompletionDuration: null,
          medianCompletionDuration: null,
          longestCompletionDuration: null,
          shortestCompletionDuration: null,
        },
        statusDistribution: [],
        activity: {
          createdByDay: [],
          completedByDay: [],
        },
        hierarchy: {
          tree: [],
          orphans: [],
          cycles: [],
        },
        blocked: [],
      },
      logs: {
        records: [],
        statistics: {
          count: 0,
          unlinkedCount: 0,
          firstTimestamp: "",
          latestTimestamp: "",
          byType: {},
          issuesCount: 0,
          attemptsCount: 0,
          logsPerSession: null,
          logsPerTask: null,
          tasksWithLogs: 0,
          tasksWithoutLogs: 0,
        },
        activity: {
          byDay: [],
          byHour: [],
        },
        taskAnalysis: {
          mostLoggedTasks: [],
          tasksWithoutLogs: [],
          issuesByTask: [],
          attemptsByTask: [],
          repeatedAttempts: [],
        },
        invalidReferences: [],
      },
      decisions: {
        records: [],
        statistics: {
          count: 0,
          unlinkedCount: 0,
          firstTimestamp: "",
          latestTimestamp: "",
          byTopic: [],
          repeatedTopics: [],
          uncategorizedCount: 0,
          byTag: [],
        },
        references: {
          byType: {},
          tasksWithDecisions: [],
          sessionsWithDecisions: [],
          invalid: [],
        },
        activity: {
          byDay: [],
        },
      },
      activity: {
        recent: [],
        timeline: [],
      },
      integrity: {
        valid: true,
        invalidTimestamps: [],
        invalidReferences: [],
        invalidParentReferences: [],
        orphanTasks: [],
        cyclicTasks: [],
        missingRequiredFields: [],
        limitations: [],
      },
    } satisfies RawReportData;

    const response: Pick<Response, "ok" | "status" | "json"> = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(rawData),
    };

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(response as Response);

    const result = await loadContext();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith("/ctx.json");
    expect(response.json).toHaveBeenCalledOnce();
    expect(result).toEqual(rawData);
  });

  it("throws when ctx.json cannot be fetched", async () => {
    const response: Pick<Response, "ok" | "status" | "json"> = {
      ok: false,
      status: 404,
      json: vi.fn(),
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue(response as Response);

    await expect(loadContext()).rejects.toThrow("Failed to load ctx.json: 404");
  });

  it("propagates errors from response.json", async () => {
    const error = new Error("Invalid JSON");

    const response: Pick<Response, "ok" | "status" | "json"> = {
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(error),
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue(response as Response);

    await expect(loadContext()).rejects.toBe(error);
  });
});
