import { describe, expect, it } from "vitest";

import { processReport } from "../../src/data/processor";
import type { RawReportData } from "../../src/data/models/raw";

function createRawData(): RawReportData {
  return {
    metadata: {
      project: {
        name: "example-project",
        root: "/projects/example",
        createdAt: "2026-09-01T09:00:00",
      },
      ctxVersion: "0.1.0",
      timezone: "Asia/Kolkata",
      dataRange: {
        firstActivity: "2026-09-01T09:00:00",
        lastActivity: "2026-09-03T18:00:00",
      },
    },

    sessions: {
      records: [
        {
          id: "session-1",
          startTime: "2026-09-01T09:00:00",
          endTime: "2026-09-01T12:00:00",
          duration: 10800,
          note: "Initial implementation",
          environment: "local",
          status: "completed",
          taskIds: ["task-1"],
        },
        {
          id: "session-2",
          startTime: "2026-09-03T14:00:00",
          endTime: null,
          duration: null,
          note: "Current work",
          environment: "local",
          status: "active",
          taskIds: ["task-2"],
        },
      ],
      statistics: {
        count: 2,
        completedCount: 1,
        activeCount: 1,
        totalDuration: 10800,
        averageDuration: 10800,
        medianDuration: 10800,
        longestDuration: 10800,
        shortestDuration: 10800,
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
      activity: {
        firstStart: "2026-09-01T09:00:00",
        latestEnd: "2026-09-01T12:00:00",
        calendarDays: 3,
        activeDays: 2,
        inactiveDays: 1,
        dailyCounts: [
          {
            date: "2026-09-01",
            count: 1,
          },
          {
            date: "2026-09-03",
            count: 1,
          },
        ],
        dailyDurations: [
          {
            date: "2026-09-01",
            duration: 10800,
          },
          {
            date: "2026-09-03",
            duration: 0,
          },
        ],
        startByHour: [
          {
            hour: 9,
            count: 1,
          },
          {
            hour: 14,
            count: 1,
          },
        ],
        startByDayOfWeek: [
          {
            day: "Monday",
            count: 1,
          },
          {
            day: "Wednesday",
            count: 1,
          },
        ],
        averageStartTime: "11:30",
        peakStartHour: 9,
      },
      gaps: {
        values: [187200],
        average: 187200,
        median: 187200,
        longest: 187200,
        shortest: 187200,
        distribution: [
          {
            label: "24h+",
            count: 1,
          },
        ],
      },
    },

    tasks: {
      records: [
        {
          id: "task-1",
          title: "Build loader",
          description: "Implement the context loader",
          status: "completed",
          parentId: null,
          createdAt: "2026-09-01T09:00:00",
          completedAt: "2026-09-01T12:00:00",
          completionDuration: 10800,
          blockReason: null,
          sessionId: "session-1",
          subtaskCount: 1,
          logCount: 2,
          decisionCount: 1,
          lastActivity: "2026-09-01T12:00:00",
        },
        {
          id: "task-2",
          title: "Build processor",
          description: null,
          status: "in-progress",
          parentId: null,
          createdAt: "2026-09-03T14:00:00",
          completedAt: null,
          completionDuration: null,
          blockReason: null,
          sessionId: "session-2",
          subtaskCount: 0,
          logCount: 1,
          decisionCount: 0,
          lastActivity: "2026-09-03T16:00:00",
        },
        {
          id: "task-3",
          title: "Write documentation",
          description: null,
          status: "pending",
          parentId: "task-2",
          createdAt: "2026-09-03T16:00:00",
          completedAt: null,
          completionDuration: null,
          blockReason: null,
          sessionId: null,
          subtaskCount: 0,
          logCount: 0,
          decisionCount: 0,
          lastActivity: "2026-09-03T16:00:00",
        },
        {
          id: "task-4",
          title: "Fix integration",
          description: null,
          status: "blocked",
          parentId: null,
          createdAt: "2026-09-03T17:00:00",
          completedAt: null,
          completionDuration: null,
          blockReason: "Waiting for API changes",
          sessionId: null,
          subtaskCount: 0,
          logCount: 0,
          decisionCount: 0,
          lastActivity: "2026-09-03T17:00:00",
        },
      ],
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
        averageCompletionDuration: 10800,
        medianCompletionDuration: 10800,
        longestCompletionDuration: 10800,
        shortestCompletionDuration: 10800,
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
      activity: {
        createdByDay: [
          {
            date: "2026-09-01",
            count: 1,
          },
          {
            date: "2026-09-03",
            count: 3,
          },
        ],
        completedByDay: [
          {
            date: "2026-09-01",
            count: 1,
          },
        ],
      },
      hierarchy: {
        tree: [
          {
            taskId: "task-2",
            children: ["task-3"],
          },
        ],
        orphans: ["task-4"],
        cycles: [],
      },
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
          timestamp: "2026-09-01T10:00:00",
          message: "Started implementation",
          type: "note",
          sessionId: "session-1",
          taskId: "task-1",
        },
        {
          id: "log-2",
          timestamp: "2026-09-01T11:00:00",
          message: "Encountered an issue",
          type: "issue",
          sessionId: "session-1",
          taskId: "task-1",
        },
        {
          id: "log-3",
          timestamp: "2026-09-03T15:00:00",
          message: "Trying another approach",
          type: "attempt",
          sessionId: "session-2",
          taskId: "task-2",
        },
      ],
      statistics: {
        count: 3,
        unlinkedCount: 0,
        firstTimestamp: "2026-09-01T10:00:00",
        latestTimestamp: "2026-09-03T15:00:00",
        byType: {
          note: 1,
          issue: 1,
          attempt: 1,
        },
        issuesCount: 1,
        attemptsCount: 1,
        logsPerSession: 1.5,
        logsPerTask: 1,
        tasksWithLogs: 2,
        tasksWithoutLogs: 2,
      },
      activity: {
        byDay: [
          {
            date: "2026-09-01",
            count: 2,
          },
          {
            date: "2026-09-03",
            count: 1,
          },
        ],
        byHour: [
          {
            hour: 10,
            count: 1,
          },
          {
            hour: 11,
            count: 1,
          },
          {
            hour: 15,
            count: 1,
          },
        ],
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
      invalidReferences: [
        {
          type: "task",
          id: "missing-task",
        },
      ],
    },

    decisions: {
      records: [
        {
          id: "decision-1",
          topic: "architecture",
          reasoning: "Keep the report processor lightweight.",
          tags: ["architecture", "processor"],
          timestamp: "2026-09-01T11:30:00",
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
          timestamp: "2026-09-03T15:30:00",
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
          timestamp: "2026-09-03T16:00:00",
          reference: null,
        },
      ],
      statistics: {
        count: 3,
        unlinkedCount: 1,
        firstTimestamp: "2026-09-01T11:30:00",
        latestTimestamp: "2026-09-03T16:00:00",
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
        },
        tasksWithDecisions: ["task-1", "task-2"],
        sessionsWithDecisions: [],
        invalid: [],
      },
      activity: {
        byDay: [
          {
            date: "2026-09-01",
            count: 1,
          },
          {
            date: "2026-09-03",
            count: 2,
          },
        ],
      },
    },

    activity: {
      recent: [
        {
          timestamp: "2026-09-03T16:00:00",
          type: "decision",
          id: "decision-3",
          taskId: null,
          sessionId: null,
          message: "Test the public processor contract.",
        },
      ],
      timeline: [
        {
          timestamp: "2026-09-01T09:00:00",
          type: "session",
          id: "session-1",
        },
        {
          timestamp: "2026-09-03T16:00:00",
          type: "decision",
          id: "decision-3",
        },
      ],
    },

    integrity: {
      valid: true,
      invalidTimestamps: [],
      invalidReferences: [],
      invalidParentReferences: [],
      orphanTasks: ["task-4"],
      cyclicTasks: [],
      missingRequiredFields: [],
      limitations: [],
    },
  };
}

describe("data/processor", () => {
  it("maps CTX metadata and applies report metadata options", () => {
    const raw = createRawData();

    const result = processReport(raw, {
      generatedAt: "2026-09-18T12:00:00.000Z",
      reportVersion: "2",
    });

    expect(result.metadata).toEqual({
      project: raw.metadata.project,
      ctxVersion: raw.metadata.ctxVersion,
      timezone: raw.metadata.timezone,
      dataRange: raw.metadata.dataRange,
      generatedAt: "2026-09-18T12:00:00.000Z",
      reportVersion: "2",
    });
  });

  it("uses default report metadata when no options are provided", () => {
    const raw = createRawData();

    const before = Date.now();
    const result = processReport(raw);
    const after = Date.now();

    expect(result.metadata.reportVersion).toBe("1");

    const generatedAt = Date.parse(result.metadata.generatedAt);

    expect(generatedAt).toBeGreaterThanOrEqual(before);
    expect(generatedAt).toBeLessThanOrEqual(after);
  });

  it("maps overview metrics and current state", () => {
    const raw = createRawData();

    const result = processReport(raw, {
      generatedAt: "2026-09-18T12:00:00.000Z",
    });

    expect(result.overview.metrics).toEqual({
      sessions: 2,
      recordedDuration: 10800,
      activeDays: 2,

      tasks: 4,
      completedTasks: 1,
      inProgressTasks: 1,
      blockedTasks: 1,
      pendingTasks: 1,

      logs: 3,
      decisions: 3,

      taskCompletionRate: 25,
      taskOpenRate: 75,
    });

    expect(result.overview.currentState.activeSession).toEqual(
      raw.sessions.records[1],
    );

    expect(result.overview.currentState.activeTask).toEqual(
      raw.tasks.records[1],
    );

    expect(result.overview.currentState.pendingTaskCount).toBe(1);
    expect(result.overview.currentState.blockedTaskCount).toBe(1);

    expect(result.overview.currentState.latestLog).toEqual(raw.logs.records[2]);

    expect(result.overview.currentState.latestDecision).toEqual(
      raw.decisions.records[2],
    );
  });

  it("maps overview activity without changing the source records", () => {
    const raw = createRawData();

    const result = processReport(raw);

    expect(result.overview.recentActivity).toEqual(raw.activity.recent);
    expect(result.overview.timeline).toEqual(raw.activity.timeline);
  });

  it("maps session data and calculates session evaluations", () => {
    const raw = createRawData();

    const result = processReport(raw);

    expect(result.sessions.records).toEqual(raw.sessions.records);
    expect(result.sessions.statistics).toEqual(raw.sessions.statistics);
    expect(result.sessions.durationDistribution).toEqual(
      raw.sessions.durationDistribution,
    );
    expect(result.sessions.gaps).toEqual(raw.sessions.gaps);

    expect(result.sessions.activity).toEqual({
      firstStart: "2026-09-01T09:00:00",
      latestEnd: "2026-09-01T12:00:00",
      calendarDays: 3,
      activeDays: 2,
      inactiveDays: 1,
      dailyCounts: [
        {
          date: "2026-09-01",
          value: 1,
        },
        {
          date: "2026-09-03",
          value: 1,
        },
      ],
      dailyDurations: [
        {
          date: "2026-09-01",
          value: 10800,
        },
        {
          date: "2026-09-03",
          value: 0,
        },
      ],
      startByHour: [
        {
          label: "9",
          count: 1,
        },
        {
          label: "14",
          count: 1,
        },
      ],
      startByDayOfWeek: [
        {
          label: "Monday",
          count: 1,
        },
        {
          label: "Wednesday",
          count: 1,
        },
      ],
      averageStartTime: "11:30",
      peakStartHour: 9,
    });

    expect(result.sessions.evaluations).toEqual({
      workContinuityRatio:
        10800 /
        ((Date.parse("2026-09-03T18:00:00") -
          Date.parse("2026-09-01T09:00:00")) /
          1000),
      averageSessionsPerActiveDay: 1,
      averageSessionsPerCalendarDay: 2 / 3,
      averageRecordedTimePerActiveDay: 5400,
      averageRecordedTimePerCalendarDay: 3600,
    });
  });

  it("maps task data and calculates task status percentages", () => {
    const raw = createRawData();

    const result = processReport(raw);

    expect(result.tasks.records).toEqual(raw.tasks.records);
    expect(result.tasks.statistics).toEqual(raw.tasks.statistics);
    expect(result.tasks.statusDistribution).toEqual(
      raw.tasks.statusDistribution,
    );
    expect(result.tasks.hierarchy).toEqual(raw.tasks.hierarchy);
    expect(result.tasks.blocked).toEqual(raw.tasks.blocked);

    expect(result.tasks.activity).toEqual({
      createdByDay: [
        {
          date: "2026-09-01",
          value: 1,
        },
        {
          date: "2026-09-03",
          value: 3,
        },
      ],
      completedByDay: [
        {
          date: "2026-09-01",
          value: 1,
        },
      ],
    });

    expect(result.tasks.evaluations).toEqual({
      completionRate: 25,
      pendingRate: 25,
      inProgressRate: 25,
      blockedRate: 25,
      openRate: 75,
    });
  });

  it("maps log data and calculates log evaluations", () => {
    const raw = createRawData();

    const result = processReport(raw);

    expect(result.logs.records).toEqual(raw.logs.records);
    expect(result.logs.statistics).toEqual(raw.logs.statistics);
    expect(result.logs.invalidReferences).toEqual(raw.logs.invalidReferences);

    expect(result.logs.activity).toEqual({
      byDay: [
        {
          date: "2026-09-01",
          value: 2,
        },
        {
          date: "2026-09-03",
          value: 1,
        },
      ],
      byHour: [
        {
          label: "10",
          count: 1,
        },
        {
          label: "11",
          count: 1,
        },
        {
          label: "15",
          count: 1,
        },
      ],
    });

    expect(result.logs.taskAnalysis).toEqual({
      mostLoggedTasks: [
        {
          id: "task-1",
          count: 2,
        },
        {
          id: "task-2",
          count: 1,
        },
      ],
      tasksWithoutLogs: ["task-3", "task-4"],
      issuesByTask: [
        {
          id: "task-1",
          count: 1,
        },
      ],
      attemptsByTask: [
        {
          id: "task-2",
          count: 1,
        },
      ],
      repeatedAttempts: raw.logs.taskAnalysis.repeatedAttempts,
    });

    expect(result.logs.evaluations.typePercentages.note).toBeCloseTo(100 / 3);
    expect(result.logs.evaluations.typePercentages.issue).toBeCloseTo(100 / 3);
    expect(result.logs.evaluations.typePercentages.attempt).toBeCloseTo(
      100 / 3,
    );

    expect(result.logs.evaluations.issuePercentage).toBeCloseTo(100 / 3);
    expect(result.logs.evaluations.attemptPercentage).toBeCloseTo(100 / 3);

    expect(result.logs.evaluations.issueWithoutAttemptPercentage).toBe(100);
    expect(result.logs.evaluations.logsPerRecordedHour).toBe(1);
  });

  it("maps decision data and calculates decision evaluations", () => {
    const raw = createRawData();

    const result = processReport(raw);

    expect(result.decisions.records).toEqual(raw.decisions.records);
    expect(result.decisions.statistics).toEqual(raw.decisions.statistics);
    expect(result.decisions.references).toEqual(raw.decisions.references);

    expect(result.decisions.activity).toEqual({
      byDay: [
        {
          date: "2026-09-01",
          value: 1,
        },
        {
          date: "2026-09-03",
          value: 2,
        },
      ],
    });

    expect(result.decisions.evaluations).toEqual({
      topicPercentages: {
        architecture: (2 / 3) * 100,
        testing: (1 / 3) * 100,
      },
      tagPercentages: {
        architecture: (2 / 3) * 100,
        processor: (1 / 3) * 100,
        testing: (1 / 3) * 100,
      },
      decisionsPerTask: 3 / 4,
      decisionsPerSession: 3 / 2,
      topTopicShare: (2 / 3) * 100,
    });
  });

  it("returns zero for percentage calculations when there are no tasks", () => {
    const raw = createRawData();

    raw.tasks.statistics = {
      ...raw.tasks.statistics,
      count: 0,
      completedCount: 0,
      pendingCount: 0,
      inProgressCount: 0,
      blockedCount: 0,
      openCount: 0,
    };

    raw.tasks.records = [];

    const result = processReport(raw);

    expect(result.overview.metrics.taskCompletionRate).toBe(0);
    expect(result.overview.metrics.taskOpenRate).toBe(0);

    expect(result.tasks.evaluations).toEqual({
      completionRate: 0,
      pendingRate: 0,
      inProgressRate: 0,
      blockedRate: 0,
      openRate: 0,
    });

    expect(result.decisions.evaluations.decisionsPerTask).toBe(0);
  });

  it("returns null for work continuity when the activity span is invalid", () => {
    const raw = createRawData();

    raw.metadata.dataRange = {
      firstActivity: "2026-09-03T18:00:00",
      lastActivity: "2026-09-03T18:00:00",
    };

    const result = processReport(raw);

    expect(result.sessions.evaluations.workContinuityRatio).toBeNull();
  });

  it("returns null for top topic share when there are no decisions", () => {
    const raw = createRawData();

    raw.decisions.statistics = {
      ...raw.decisions.statistics,
      count: 0,
      byTopic: [],
    };

    const result = processReport(raw);

    expect(result.decisions.evaluations.topTopicShare).toBeNull();
  });

  it("returns the latest log and decision based on timestamp rather than record position", () => {
    const raw = createRawData();

    const latestLog = {
      ...raw.logs.records[2],
      id: "log-latest",
      timestamp: "2026-09-05T10:00:00",
    };

    const latestDecision = {
      ...raw.decisions.records[2],
      id: "decision-latest",
      timestamp: "2026-09-05T11:00:00",
    };

    raw.logs.records = [latestLog, raw.logs.records[0], raw.logs.records[1]];

    raw.decisions.records = [
      latestDecision,
      raw.decisions.records[0],
      raw.decisions.records[1],
    ];

    const result = processReport(raw);

    expect(result.overview.currentState.latestLog).toEqual(latestLog);
    expect(result.overview.currentState.latestDecision).toEqual(latestDecision);
  });

  it("returns no active task when there is no active session", () => {
    const raw = createRawData();

    raw.sessions.records = raw.sessions.records.map((session) => ({
      ...session,
      status: "completed",
    }));

    const result = processReport(raw);

    expect(result.overview.currentState.activeSession).toBeNull();
    expect(result.overview.currentState.activeTask).toBeNull();
  });
});
