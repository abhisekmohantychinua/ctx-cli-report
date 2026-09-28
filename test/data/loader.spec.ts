import { afterEach, describe, expect, it, vi } from "vitest";
import { DateTime, Duration } from "luxon";

import { loadContext } from "../../src/data/loader";

describe("data/loader", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  const contextData = {
    metadata: {
      project: {
        name: "example",
        root: "/projects/example",
        createdAt: "2026-09-01T10:00:00Z",
        version: "1.0.0",
        timezone: "Asia/Kolkata",
        dateTimeTemplate: "dd MMM yyyy, HH:mm",
      },
      generatedAt: "2026-09-25T10:00:00Z",
      reportVersion: "1.0.0",
    },

    sessions: {
      records: [
        {
          id: "session-1",
          startTime: "2026-09-01T10:00:00Z",
          endTime: "2026-09-01T11:30:00Z",
          duration: "PT1H30M",
          note: "Initial development session",
          status: "COMPLETED",
        },
      ],
      statistics: {
        count: 1,
        completedCount: 1,
        activeCount: 0,
        totalDuration: "PT1H30M",
        averageDuration: "PT1H30M",
        medianDuration: "PT1H30M",
        longestDuration: "PT1H30M",
        shortestDuration: "PT1H30M",
      },
      durationDistribution: [
        {
          label: "1-2 hours",
          count: 1,
        },
      ],
      gaps: {
        values: [],
        average: "PT0S",
        median: "PT0S",
        longest: "PT0S",
        shortest: "PT0S",
        distribution: [],
      },
    },

    tasks: {
      records: [
        {
          id: "task-1",
          title: "Implement report",
          description: "Implement the project report",
          status: "COMPLETED",
          createdAt: "2026-09-01T09:00:00Z",
          completedAt: "2026-09-01T12:00:00Z",
          completionDuration: "PT3H",
          blockReason: null,
          subtaskCount: 1,
        },
      ],
      statistics: {
        count: 1,
        completedCount: 1,
        pendingCount: 0,
        inProgressCount: 0,
        blockedCount: 0,
        openCount: 0,
        rootCount: 1,
        subtaskCount: 1,
        maxDepth: 1,
        averageCompletionDuration: "PT3H",
        medianCompletionDuration: "PT3H",
        longestCompletionDuration: "PT3H",
        shortestCompletionDuration: "PT3H",
      },
      statusDistribution: [
        {
          status: "COMPLETED",
          count: 1,
        },
      ],
      tree: [
        {
          task: {
            id: "task-1",
            title: "Implement report",
            description: "Implement the project report",
            status: "COMPLETED",
            createdAt: "2026-09-01T09:00:00Z",
            completedAt: "2026-09-01T12:00:00Z",
            completionDuration: "PT3H",
            blockReason: null,
            subtaskCount: 1,
          },
          children: [],
        },
      ],
      blocked: [],
    },

    logs: {
      records: [
        {
          id: "log-1",
          timestamp: "2026-09-01T10:30:00Z",
          note: "Report implementation started",
          type: "NOTE",
          reference: {
            type: "TASK",
            id: "task-1",
          },
        },
      ],
      statistics: {
        count: 1,
        unlinkedCount: 0,
        firstTimestamp: "2026-09-01T10:30:00Z",
        latestTimestamp: "2026-09-01T10:30:00Z",
        byType: {
          note: 1,
          idea: 0,
          issue: 0,
          attempt: 0,
        },
        issuesCount: 0,
        attemptsCount: 0,
        logsPerSession: 1,
        logsPerTask: 1,
        tasksWithLogs: 1,
        tasksWithoutLogs: 0,
      },
      taskAnalysis: {
        mostLoggedTasks: [
          {
            taskId: "task-1",
            count: 1,
          },
        ],
        tasksWithoutLogs: [],
        issuesByTask: [],
        attemptsByTask: [],
        repeatedAttempts: [],
      },
    },

    decisions: {
      records: [
        {
          id: "decision-1",
          topic: "Report format",
          reasoning: "Use a structured JSON contract for the report",
          tags: ["architecture", "report"],
          timestamp: "2026-09-01T13:00:00Z",
          reference: {
            type: "TASK",
            id: "task-1",
          },
        },
      ],
      statistics: {
        count: 1,
        unlinkedCount: 0,
        firstTimestamp: "2026-09-01T13:00:00Z",
        latestTimestamp: "2026-09-01T13:00:00Z",
        byTopic: [
          {
            topic: "Report format",
            count: 1,
          },
        ],
        repeatedTopics: [],
        uncategorizedCount: 0,
        byTag: [
          {
            tag: "architecture",
            count: 1,
          },
          {
            tag: "report",
            count: 1,
          },
        ],
      },
      references: {
        byType: {
          task: 1,
          session: 0,
        },
        tasksWithDecisions: ["task-1"],
        sessionsWithDecisions: [],
      },
    },
  };

  it("loads and parses ctx.json from the root path", async () => {
    const response = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: vi.fn().mockResolvedValue(contextData),
    } as unknown as Response;

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(response);

    const result = await loadContext();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith("/ctx.json");
    expect(response.json).toHaveBeenCalledOnce();

    expect(result.metadata.project.name).toBe("example");
    expect(result.metadata.project.timezone).toBe("Asia/Kolkata");

    expect(result.metadata.generatedAt).toBeInstanceOf(DateTime);
    expect(result.metadata.project.createdAt).toBeInstanceOf(DateTime);

    expect(result.sessions.records[0].startTime).toBeInstanceOf(DateTime);
    expect(result.sessions.records[0].endTime).toBeInstanceOf(DateTime);
    expect(result.sessions.records[0].duration).toBeInstanceOf(Duration);

    expect(result.tasks.records[0].createdAt).toBeInstanceOf(DateTime);
    expect(result.tasks.records[0].completionDuration).toBeInstanceOf(Duration);

    expect(result.logs.records[0].timestamp).toBeInstanceOf(DateTime);
    expect(result.decisions.records[0].timestamp).toBeInstanceOf(DateTime);
  });

  it("loads ctx.json from the configured base path", async () => {
    vi.stubEnv("BASE_URL", "./");

    const response = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: vi.fn().mockResolvedValue(contextData),
    } as unknown as Response;

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(response);

    const result = await loadContext();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith("./ctx.json");
    expect(response.json).toHaveBeenCalledOnce();

    expect(result.metadata.project.name).toBe("example");
  });

  it("throws when ctx.json cannot be fetched", async () => {
    const response = {
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: vi.fn(),
    } as unknown as Response;

    vi.spyOn(globalThis, "fetch").mockResolvedValue(response);

    await expect(loadContext()).rejects.toThrow(
      "Failed to load ctx.json: 404 Not Found",
    );
  });

  it("propagates errors from response.json", async () => {
    const error = new Error("Invalid JSON");

    const response = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: vi.fn().mockRejectedValue(error),
    } as unknown as Response;

    vi.spyOn(globalThis, "fetch").mockResolvedValue(response);

    await expect(loadContext()).rejects.toBe(error);
  });

  it("rejects a payload that does not conform to the report contract", async () => {
    const invalidData = {
      ...contextData,
      metadata: {
        ...contextData.metadata,
        project: {
          ...contextData.metadata.project,
          name: undefined,
        },
      },
    };

    const response = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: vi.fn().mockResolvedValue(invalidData),
    } as unknown as Response;

    vi.spyOn(globalThis, "fetch").mockResolvedValue(response);

    await expect(loadContext()).rejects.toThrow();
  });
});
