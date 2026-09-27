import { DateTime, Duration } from "luxon";
import { describe, expect, it } from "vitest";

import { processReportData } from "../../src/data/processor";
import type { ReportData } from "../../src/data/schemas/report-data-schema";

function instant(value: string): DateTime<true> {
  const dateTime = DateTime.fromISO(value, { setZone: true });

  if (!dateTime.isValid) {
    throw new Error(`Invalid test instant: ${value}`);
  }

  return dateTime.toUTC();
}

function duration(value: string): Duration<true> {
  const parsedDuration = Duration.fromISO(value);

  if (!parsedDuration.isValid) {
    throw new Error(`Invalid test duration: ${value}`);
  }

  return parsedDuration;
}

function createReportData(): ReportData {
  const task1 = {
    id: "task-1",
    title: "Build loader",
    description: "Implement the context loader",
    status: "completed",
    createdAt: instant("2026-09-01T09:00:00+05:30"),
    completedAt: instant("2026-09-01T12:00:00+05:30"),
    completionDuration: duration("PT3H"),
    blockReason: null,
    subtaskCount: 1,
  };

  const task2 = {
    id: "task-2",
    title: "Build processor",
    description: null,
    status: "in-progress",
    createdAt: instant("2026-09-03T14:00:00+05:30"),
    completedAt: null,
    completionDuration: null,
    blockReason: null,
    subtaskCount: 1,
  };

  const task3 = {
    id: "task-3",
    title: "Write documentation",
    description: null,
    status: "pending",
    createdAt: instant("2026-09-03T16:00:00+05:30"),
    completedAt: null,
    completionDuration: null,
    blockReason: null,
    subtaskCount: 0,
  };

  const task4 = {
    id: "task-4",
    title: "Fix integration",
    description: null,
    status: "blocked",
    createdAt: instant("2026-09-03T17:00:00+05:30"),
    completedAt: null,
    completionDuration: null,
    blockReason: "Waiting for API changes",
    subtaskCount: 0,
  };

  return {
    metadata: {
      project: {
        name: "example-project",
        root: "/projects/example",
        createdAt: instant("2026-09-01T09:00:00+05:30"),
        version: "0.1.0",
        timezone: "Asia/Kolkata",
        dateTimeTemplate: "dd MMM yyyy hh:mm:ss a z",
      },
      generatedAt: instant("2026-09-03T18:00:00+05:30"),
      reportVersion: "v0.1.0SNAPSHOT",
    },

    sessions: {
      records: [
        {
          id: "session-1",
          startTime: instant("2026-09-01T09:00:00+05:30"),
          endTime: instant("2026-09-01T12:00:00+05:30"),
          duration: duration("PT3H"),
          note: "Initial implementation",
          status: "completed",
        },
        {
          id: "session-2",
          startTime: instant("2026-09-03T14:00:00+05:30"),
          endTime: null,
          duration: duration("PT0S"),
          note: "Current work",
          status: "active",
        },
      ],

      statistics: {
        count: 2,
        completedCount: 1,
        activeCount: 1,
        totalDuration: duration("PT3H"),
        averageDuration: duration("PT3H"),
        medianDuration: duration("PT3H"),
        longestDuration: duration("PT3H"),
        shortestDuration: duration("PT3H"),
      },

      durationDistribution: [
        {
          label: "0-1h",
          count: 0,
        },
        {
          label: "1-4h",
          count: 2,
        },
      ],

      gaps: {
        values: [duration("PT50H")],
        average: duration("PT50H"),
        median: duration("PT50H"),
        longest: duration("PT50H"),
        shortest: duration("PT50H"),
        distribution: [
          {
            label: "24h+",
            count: 1,
          },
        ],
      },
    },

    tasks: {
      records: [task1, task2, task3, task4],

      statistics: {
        count: 4,
        completedCount: 1,
        pendingCount: 1,
        inProgressCount: 1,
        blockedCount: 1,
        openCount: 3,
        rootCount: 3,
        subtaskCount: 1,
        maxDepth: 1,
        averageCompletionDuration: duration("PT3H"),
        medianCompletionDuration: duration("PT3H"),
        longestCompletionDuration: duration("PT3H"),
        shortestCompletionDuration: duration("PT3H"),
      },

      statusDistribution: [
        {
          status: "completed",
          count: 1,
        },
        {
          status: "in-progress",
          count: 1,
        },
        {
          status: "pending",
          count: 1,
        },
        {
          status: "blocked",
          count: 1,
        },
      ],

      tree: [
        {
          task: task1,
          children: [],
        },
        {
          task: task2,
          children: [
            {
              task: task3,
              children: [],
            },
          ],
        },
        {
          task: task4,
          children: [],
        },
      ],

      blocked: [
        {
          taskId: "task-4",
          reason: "Waiting for API changes",
        },
      ],
    },

    logs: {
      records: [
        {
          id: "log-1",
          timestamp: instant("2026-09-01T10:00:00+05:30"),
          note: "Started implementation",
          type: "note",
          reference: {
            type: "task",
            id: "task-1",
          },
        },
        {
          id: "log-2",
          timestamp: instant("2026-09-01T11:00:00+05:30"),
          note: "Encountered an issue",
          type: "issue",
          reference: {
            type: "task",
            id: "task-1",
          },
        },
        {
          id: "log-3",
          timestamp: instant("2026-09-03T15:00:00+05:30"),
          note: "Trying another approach",
          type: "attempt",
          reference: {
            type: "task",
            id: "task-2",
          },
        },
      ],

      statistics: {
        count: 3,
        unlinkedCount: 0,
        firstTimestamp: instant("2026-09-01T10:00:00+05:30"),
        latestTimestamp: instant("2026-09-03T15:00:00+05:30"),

        byType: {
          note: 1,
          idea: 0,
          issue: 1,
          attempt: 1,
        },

        issuesCount: 1,
        attemptsCount: 1,
        logsPerSession: 1.5,
        logsPerTask: 1.5,
        tasksWithLogs: 2,
        tasksWithoutLogs: 2,
      },

      taskAnalysis: {
        mostLoggedTasks: [
          {
            taskId: "task-1",
            count: 2,
          },
          {
            taskId: "task-2",
            count: 1,
          },
        ],

        tasksWithoutLogs: ["task-3", "task-4"],

        issuesByTask: [
          {
            taskId: "task-1",
            count: 1,
          },
        ],

        attemptsByTask: [
          {
            taskId: "task-2",
            count: 1,
          },
        ],

        repeatedAttempts: [
          {
            taskId: "task-2",
            count: 2,
          },
        ],
      },
    },

    decisions: {
      records: [
        {
          id: "decision-1",
          topic: "architecture",
          reasoning: "Keep the report processor lightweight.",
          tags: ["architecture", "processor"],
          timestamp: instant("2026-09-01T11:30:00+05:30"),
          reference: {
            type: "task",
            id: "task-1",
          },
        },
        {
          id: "decision-2",
          topic: "architecture",
          reasoning: "Use a page-oriented report model.",
          tags: ["architecture"],
          timestamp: instant("2026-09-03T15:30:00+05:30"),
          reference: {
            type: "task",
            id: "task-2",
          },
        },
        {
          id: "decision-3",
          topic: "testing",
          reasoning: "Test the public processor contract.",
          tags: ["testing"],
          timestamp: instant("2026-09-03T16:00:00+05:30"),
          reference: null,
        },
      ],

      statistics: {
        count: 3,
        unlinkedCount: 1,
        firstTimestamp: instant("2026-09-01T11:30:00+05:30"),
        latestTimestamp: instant("2026-09-03T16:00:00+05:30"),

        byTopic: [
          {
            topic: "architecture",
            count: 2,
          },
          {
            topic: "testing",
            count: 1,
          },
        ],

        repeatedTopics: ["architecture"],
        uncategorizedCount: 0,

        byTag: [
          {
            tag: "architecture",
            count: 2,
          },
          {
            tag: "processor",
            count: 1,
          },
          {
            tag: "testing",
            count: 1,
          },
        ],
      },

      references: {
        byType: {
          task: 2,
          session: 0,
        },
        tasksWithDecisions: ["task-1", "task-2"],
        sessionsWithDecisions: [],
      },
    },
  };
}

describe("data/processor", () => {
  it("maps metadata", () => {
    const source = createReportData();
    const result = processReportData(source);

    expect(result.metadata).toEqual(source.metadata);
  });

  it("maps overview metrics", () => {
    const source = createReportData();
    const result = processReportData(source);

    expect(result.overview.metrics.sessions).toBe(2);
    expect(result.overview.metrics.recordedDuration.toMillis()).toBe(
      3 * 60 * 60 * 1000,
    );
    expect(result.overview.metrics.activeDays).toBe(2);
    expect(result.overview.metrics.tasks).toBe(4);
    expect(result.overview.metrics.completedTasks).toBe(1);
    expect(result.overview.metrics.inProgressTasks).toBe(1);
    expect(result.overview.metrics.blockedTasks).toBe(1);
    expect(result.overview.metrics.pendingTasks).toBe(1);
    expect(result.overview.metrics.logs).toBe(3);
    expect(result.overview.metrics.decisions).toBe(3);
    expect(result.overview.metrics.taskCompletionRate).toBe(25);
    expect(result.overview.metrics.taskOpenRate).toBe(75);
  });

  it("identifies the active session and task in progress", () => {
    const source = createReportData();
    const result = processReportData(source);

    expect(result.overview.currentState.activeSession).toBe(
      source.sessions.records[1],
    );

    expect(result.overview.currentState.activeTask).toBe(
      source.tasks.records[1],
    );
  });

  it("maps the remaining current state", () => {
    const source = createReportData();
    const result = processReportData(source);

    expect(result.overview.currentState.pendingTaskCount).toBe(1);
    expect(result.overview.currentState.blockedTaskCount).toBe(1);

    expect(result.overview.currentState.latestLog).toBe(source.logs.records[2]);

    expect(result.overview.currentState.latestDecision).toBe(
      source.decisions.records[2],
    );
  });

  it("builds recent activity in reverse chronological order", () => {
    const source = createReportData();
    const result = processReportData(source);

    expect(result.overview.recentActivity).toHaveLength(13);

    expect(
      result.overview.recentActivity.map((activity) => ({
        type: activity.type,
        id: activity.id,
        description: activity.description,
        timestamp: activity.timestamp.toISO(),
      })),
    ).toEqual([
      {
        type: "task",
        id: "task-4",
        description: "Task created: Fix integration",
        timestamp: "2026-09-03T11:30:00.000Z",
      },
      {
        type: "task",
        id: "task-3",
        description: "Task created: Write documentation",
        timestamp: "2026-09-03T10:30:00.000Z",
      },
      {
        type: "decision",
        id: "decision-3",
        description: "testing",
        timestamp: "2026-09-03T10:30:00.000Z",
      },
      {
        type: "decision",
        id: "decision-2",
        description: "architecture",
        timestamp: "2026-09-03T10:00:00.000Z",
      },
      {
        type: "log",
        id: "log-3",
        description: "Trying another approach",
        timestamp: "2026-09-03T09:30:00.000Z",
      },
      {
        type: "session",
        id: "session-2",
        description: "Session started",
        timestamp: "2026-09-03T08:30:00.000Z",
      },
      {
        type: "task",
        id: "task-2",
        description: "Task created: Build processor",
        timestamp: "2026-09-03T08:30:00.000Z",
      },
      {
        type: "task",
        id: "task-1",
        description: "Task completed: Build loader",
        timestamp: "2026-09-01T06:30:00.000Z",
      },
      {
        type: "decision",
        id: "decision-1",
        description: "architecture",
        timestamp: "2026-09-01T06:00:00.000Z",
      },
      {
        type: "log",
        id: "log-2",
        description: "Encountered an issue",
        timestamp: "2026-09-01T05:30:00.000Z",
      },
      {
        type: "log",
        id: "log-1",
        description: "Started implementation",
        timestamp: "2026-09-01T04:30:00.000Z",
      },
      {
        type: "session",
        id: "session-1",
        description: "Session recorded",
        timestamp: "2026-09-01T03:30:00.000Z",
      },
      {
        type: "task",
        id: "task-1",
        description: "Task created: Build loader",
        timestamp: "2026-09-01T03:30:00.000Z",
      },
    ]);
  });

  it("builds the timeline from recent activity", () => {
    const source = createReportData();
    const result = processReportData(source);

    expect(result.overview.timeline).toEqual(
      result.overview.recentActivity.map((activity) => ({
        timestamp: activity.timestamp,
        type: activity.type,
        id: activity.id,
        title: activity.description,
      })),
    );
  });

  it("maps sessions and derives session evaluations", () => {
    const source = createReportData();
    const result = processReportData(source);

    expect(result.sessions.records).toBe(source.sessions.records);
    expect(result.sessions.statistics).toEqual(source.sessions.statistics);
    expect(result.sessions.durationDistribution).toEqual(
      source.sessions.durationDistribution,
    );
    expect(result.sessions.gaps).toEqual(source.sessions.gaps);

    expect(result.sessions.evaluations.averageSessionsPerActiveDay).toBe(1);

    expect(result.sessions.evaluations.averageSessionsPerCalendarDay).toBe(1);

    expect(
      result.sessions.evaluations.averageRecordedTimePerActiveDay?.toMillis(),
    ).toBe(90 * 60 * 1000);

    expect(
      result.sessions.evaluations.averageRecordedTimePerCalendarDay?.toMillis(),
    ).toBe(90 * 60 * 1000);

    expect(result.sessions.evaluations.workContinuityRatio).toBeCloseTo(
      (3 * 60 * 60 * 1000) / (53 * 60 * 60 * 1000),
    );
  });

  it("returns null work continuity when fewer than two sessions exist", () => {
    const source = createReportData();

    source.sessions.records = [source.sessions.records[0]];

    const result = processReportData(source);

    expect(result.sessions.evaluations.workContinuityRatio).toBeNull();
  });

  it("returns null work continuity when the calculated span is invalid", () => {
    const source = createReportData();

    source.sessions.records = [
      {
        ...source.sessions.records[0],
        startTime: instant("2026-09-03T12:00:00+05:30"),
        endTime: instant("2026-09-03T12:00:00+05:30"),
      },
      {
        ...source.sessions.records[1],
        startTime: instant("2026-09-03T12:00:00+05:30"),
        endTime: instant("2026-09-03T12:00:00+05:30"),
      },
    ];

    const result = processReportData(source);

    expect(result.sessions.evaluations.workContinuityRatio).toBeNull();
  });

  it("maps tasks and resolves the task hierarchy", () => {
    const source = createReportData();
    const result = processReportData(source);

    expect(result.tasks.records).toBe(source.tasks.records);
    expect(result.tasks.statistics).toEqual(source.tasks.statistics);
    expect(result.tasks.statusDistribution).toEqual(
      source.tasks.statusDistribution,
    );
    expect(result.tasks.blocked).toEqual(source.tasks.blocked);

    expect(result.tasks.tree).toEqual([
      {
        task: source.tasks.records[0],
        children: [],
      },
      {
        task: source.tasks.records[1],
        children: [
          {
            task: source.tasks.records[2],
            children: [],
          },
        ],
      },
      {
        task: source.tasks.records[3],
        children: [],
      },
    ]);
  });

  it("maps logs and their task analysis", () => {
    const source = createReportData();
    const result = processReportData(source);

    expect(result.logs.records).toBe(source.logs.records);
    expect(result.logs.statistics).toEqual(source.logs.statistics);

    expect(result.logs.taskAnalysis).toEqual(source.logs.taskAnalysis);
  });

  it("maps decisions and their references", () => {
    const source = createReportData();
    const result = processReportData(source);

    expect(result.decisions.records).toBe(source.decisions.records);
    expect(result.decisions.statistics).toEqual(source.decisions.statistics);
    expect(result.decisions.references).toEqual(source.decisions.references);
  });

  it("finds the latest log and decision by timestamp rather than array position", () => {
    const source = createReportData();

    source.logs.records = [
      source.logs.records[2],
      source.logs.records[0],
      source.logs.records[1],
    ];

    source.decisions.records = [
      source.decisions.records[2],
      source.decisions.records[0],
      source.decisions.records[1],
    ];

    const result = processReportData(source);

    expect(result.overview.currentState.latestLog).toBe(source.logs.records[0]);

    expect(result.overview.currentState.latestDecision).toBe(
      source.decisions.records[0],
    );
  });

  it("finds the task in progress independently of the active session", () => {
    const source = createReportData();

    source.sessions.records = source.sessions.records.map((session) => ({
      ...session,
      status: "completed",
      endTime: session.endTime ?? instant("2026-09-03T18:00:00+05:30"),
    }));

    const result = processReportData(source);

    expect(result.overview.currentState.activeSession).toBeNull();
    expect(result.overview.currentState.activeTask).toBe(
      source.tasks.records[1],
    );
  });

  it("returns null for the active task when no task is in progress", () => {
    const source = createReportData();

    source.tasks.records = source.tasks.records.map((task) => ({
      ...task,
      status: task.status === "in-progress" ? "pending" : task.status,
    }));

    const result = processReportData(source);

    expect(result.overview.currentState.activeTask).toBeNull();
  });

  it("returns zero task rates when there are no tasks", () => {
    const source = createReportData();

    source.tasks.statistics = {
      ...source.tasks.statistics,
      count: 0,
      completedCount: 0,
      pendingCount: 0,
      inProgressCount: 0,
      blockedCount: 0,
      openCount: 0,
    };

    const result = processReportData(source);

    expect(result.overview.metrics.taskCompletionRate).toBeNull();
    expect(result.overview.metrics.taskOpenRate).toBeNull();
  });

  it("does not mutate the source data", () => {
    const source = createReportData();
    const before = JSON.stringify(source);

    processReportData(source);

    expect(JSON.stringify(source)).toBe(before);
  });
});
