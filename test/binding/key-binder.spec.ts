import { DateTime, Duration } from "luxon";
import { describe, expect, it } from "vitest";

import type { ReportData } from "../../src/data/models/report-data";
import { bindKey } from "../../src/binding/key-binder";
import { DATE_TIME_FORMAT, DURATION_FORMAT } from "../../src/binding/constants";

describe("binding/key-binder", () => {
  const generatedAt = DateTime.fromISO("2026-09-19T07:30:00.000Z", {
    setZone: true,
  });

  const createdAt = DateTime.fromISO("2026-09-11T09:45:00.000Z", {
    setZone: true,
  });

  const activeSessionStart = DateTime.fromISO("2026-09-19T06:00:00.000Z", {
    setZone: true,
  });

  const activeTaskCreatedAt = DateTime.fromISO("2026-09-17T10:15:00.000Z", {
    setZone: true,
  });

  const dateTimeTemplate = "dd-LLL-yyyy hh:mm a";
  const timeZone = "Asia/Kolkata";

  const data = {
    metadata: {
      project: {
        name: "CTX CLI",
        root: "/workspace/ctx",
        createdAt,
        version: "1.2.3",
        timezone: timeZone,
        dateTimeTemplate,
      },
      generatedAt,
      reportVersion: "v1.2.3",
    },
    overview: {
      metrics: {
        sessions: 3,
        recordedDuration: Duration.fromISO("PT6H30M"),
        activeDays: 2,
        tasks: 5,
        completedTasks: 2,
        inProgressTasks: 1,
        blockedTasks: 1,
        pendingTasks: 1,
        logs: 9,
        decisions: 4,
        taskCompletionRate: 40,
        taskOpenRate: 60,
      },
      currentState: {
        activeSession: {
          id: "session-42",
          startTime: activeSessionStart,
          endTime: null,
          duration: Duration.fromISO("PT1H45M"),
          note: "Working on bindings",
          status: "active",
        },
        activeTask: {
          id: "task-42",
          title: "Update key binder",
          description: null,
          status: "in-progress",
          createdAt: activeTaskCreatedAt,
          completedAt: null,
          completionDuration: null,
          blockReason: null,
          subtaskCount: 0,
        },
        pendingTaskCount: 1,
        blockedTaskCount: 1,
        latestLog: null,
        latestDecision: null,
      },
      recentActivity: [],
      timeline: [],
    },
    sessions: {
      records: [],
      statistics: {
        count: 0,
        completedCount: 0,
        activeCount: 0,
        totalDuration: Duration.fromISO("PT0S"),
        averageDuration: Duration.fromISO("PT0S"),
        medianDuration: Duration.fromISO("PT0S"),
        longestDuration: Duration.fromISO("PT0S"),
        shortestDuration: Duration.fromISO("PT0S"),
      },
      durationDistribution: [],
      gaps: {
        values: [],
        average: Duration.fromISO("PT0S"),
        median: Duration.fromISO("PT0S"),
        longest: Duration.fromISO("PT0S"),
        shortest: Duration.fromISO("PT0S"),
        distribution: [],
      },
      evaluations: {
        workContinuityRatio: null,
        averageSessionsPerActiveDay: null,
        averageSessionsPerCalendarDay: null,
        averageRecordedTimePerActiveDay: null,
        averageRecordedTimePerCalendarDay: null,
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
        averageCompletionDuration: Duration.fromISO("PT0S"),
        medianCompletionDuration: Duration.fromISO("PT0S"),
        longestCompletionDuration: Duration.fromISO("PT0S"),
        shortestCompletionDuration: Duration.fromISO("PT0S"),
      },
      statusDistribution: [],
      tree: [],
      blocked: [],
    },
    logs: {
      records: [],
      statistics: {
        count: 0,
        unlinkedCount: 0,
        firstTimestamp: null,
        latestTimestamp: null,
        byType: {
          note: 0,
          idea: 0,
          issue: 0,
          attempt: 0,
        },
        issuesCount: 0,
        attemptsCount: 0,
        logsPerSession: null,
        logsPerTask: null,
        tasksWithLogs: 0,
        tasksWithoutLogs: 0,
      },
      taskAnalysis: {
        mostLoggedTasks: [],
        tasksWithoutLogs: [],
        issuesByTask: [],
        attemptsByTask: [],
        repeatedAttempts: [],
      },
    },
    decisions: {
      records: [],
      statistics: {
        count: 0,
        unlinkedCount: 0,
        firstTimestamp: null,
        latestTimestamp: null,
        byTopic: [],
        repeatedTopics: [],
        uncategorizedCount: 0,
        byTag: [],
      },
      references: {
        byType: {
          task: 0,
          session: 0,
        },
        tasksWithDecisions: [],
        sessionsWithDecisions: [],
      },
    },
  } as ReportData;

  it.each([
    ["metadata.project.name", "CTX CLI"],
    [
      "metadata.generatedAt",
      generatedAt.setZone(timeZone).toFormat(DATE_TIME_FORMAT),
    ],
    [
      "metadata.project.createdAt",
      createdAt.setZone(timeZone).toFormat(DATE_TIME_FORMAT),
    ],
    ["metadata.project.root", "/workspace/ctx"],
    ["overview.metrics.sessions", "3"],
    [
      "overview.metrics.recordedDuration",
      Duration.fromISO("PT6H30M").toFormat(DURATION_FORMAT),
    ],
    ["overview.metrics.activeDays", "2"],
    ["overview.metrics.tasks", "5"],
    ["overview.metrics.taskCompletionRate", "40.00"],
    ["overview.metrics.completedTasks", "2"],
    ["overview.metrics.inProgressTasks", "1"],
    ["overview.metrics.blockedTasks", "1"],
    ["overview.metrics.pendingTasks", "1"],
    ["overview.metrics.logs", "9"],
    ["overview.metrics.decisions", "4"],
    ["overview.currentState.activeSession.id", "session-42"],
    ["overview.currentState.activeSession.status", "active"],
    [
      "overview.currentState.activeSession.startTime",
      activeSessionStart.setZone(timeZone).toFormat(DATE_TIME_FORMAT),
    ],
    [
      "overview.currentState.activeSession.duration",
      Duration.fromISO("PT1H45M").toFormat(DURATION_FORMAT),
    ],
    ["overview.currentState.activeSession.note", "Working on bindings"],
    ["overview.currentState.activeTask.title", "Update key binder"],
    ["overview.currentState.activeTask.status", "in-progress"],
    ["overview.currentState.activeTask.id", "task-42"],
    [
      "overview.currentState.activeTask.createdAt",
      activeTaskCreatedAt.setZone(timeZone).toFormat(DATE_TIME_FORMAT),
    ],
  ])("binds the current value for %s", (key, expected) => {
    const element = document.createElement("span");

    bindKey(data, key, element);

    expect(element.textContent).toBe(expected);
  });

  it("uses a dash when the completion rate is unavailable", () => {
    const emptyRateData = {
      ...data,
      overview: {
        ...data.overview,
        metrics: { ...data.overview.metrics, taskCompletionRate: null },
      },
    };
    const element = document.createElement("span");

    bindKey(emptyRateData, "overview.metrics.taskCompletionRate", element);

    expect(element.textContent).toBe("-");
  });

  it.each([
    ["overview.currentState.activeSession.id", "-"],
    ["overview.currentState.activeSession.status", "-"],
    ["overview.currentState.activeSession.startTime", ""],
    ["overview.currentState.activeSession.duration", ""],
    ["overview.currentState.activeSession.note", "-"],
    ["overview.currentState.activeTask.title", "-"],
    ["overview.currentState.activeTask.status", "-"],
    ["overview.currentState.activeTask.id", "-"],
    ["overview.currentState.activeTask.createdAt", "-"],
  ])("uses the empty-state value for %s", (key, expected) => {
    const emptyStateData = {
      ...data,
      overview: {
        ...data.overview,
        currentState: {
          ...data.overview.currentState,
          activeSession: null,
          activeTask: null,
        },
      },
    };
    const element = document.createElement("span");

    bindKey(emptyStateData, key, element);

    expect(element.textContent).toBe(expected);
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
