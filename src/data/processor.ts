import type { ReportData as SourceData } from "./schemas/report-data-schema";

import type { Data } from "./models/data";
import { DateTime, Duration } from "luxon";

/**
 * Converts validated CTX report data into the presentation-oriented model used by the generated report.
 *
 * The loader handles validation and temporal normalization before this step. This function
 * reorganizes the validated source data into report pages and derives lightweight presentation metrics.
 *
 * Expensive aggregation and relationship analysis are expected to be provided by the CTX-generated
 * report contract. This processor only performs calculations that can be derived directly and safely
 * from the validated source data.
 *
 * @param source - The validated CTX report payload to transform.
 * @returns A presentation-oriented report model ready for the UI bindings.
 */
export function processReportData(source: SourceData): Data {
  return {
    metadata: processMetadata(source),
    overview: processOverview(source),
    sessions: processSessions(source),
    tasks: processTasks(source),
    logs: processLogs(source),
    decisions: processDecisions(source),
  };
}

/**
 * Maps project and report metadata into the report data model.
 *
 * @param source - The source CTX report data.
 * @returns The sanitized metadata block used by the report pages.
 */
function processMetadata(source: SourceData): Data.Metadata {
  return {
    project: {
      name: source.metadata.project.name,
      root: source.metadata.project.root,
      createdAt: source.metadata.project.createdAt,
      version: source.metadata.project.version,
      timezone: source.metadata.project.timezone,
      dateTimeTemplate: source.metadata.project.dateTimeTemplate,
    },
    generatedAt: source.metadata.generatedAt,
    reportVersion: source.metadata.reportVersion,
  };
}

/**
 * Builds the overview model from the domain sections of the source report.
 *
 * @param source - The source CTX report data.
 * @returns A compact summary model for the main dashboard and landing page.
 */
function processOverview(source: SourceData): Data.Overview {
  const taskStatistics = source.tasks.statistics;

  return {
    metrics: {
      sessions: source.sessions.statistics.count,
      recordedDuration: source.sessions.statistics.totalDuration,
      activeDays: calculateActiveDays(source),
      tasks: taskStatistics.count,
      completedTasks: taskStatistics.completedCount,
      inProgressTasks: taskStatistics.inProgressCount,
      blockedTasks: taskStatistics.blockedCount,
      pendingTasks: taskStatistics.pendingCount,
      logs: source.logs.statistics.count,
      decisions: source.decisions.statistics.count,
      taskCompletionRate: percentage(
        taskStatistics.completedCount,
        taskStatistics.count,
      ),
      taskOpenRate: percentage(taskStatistics.openCount, taskStatistics.count),
    },

    currentState: {
      activeSession: findActiveSession(source.sessions.records),
      activeTask: findTaskInProgress(source.tasks.records),
      pendingTaskCount: taskStatistics.pendingCount,
      blockedTaskCount: taskStatistics.blockedCount,
      latestLog: latestByTimestamp(source.logs.records),
      latestDecision: latestByTimestamp(source.decisions.records),
    },

    recentActivity: buildRecentActivity(source),
    timeline: buildTimeline(source),
  };
}

/**
 * Maps session data and derives the report-side session evaluations.
 *
 * @param source - The source CTX report data.
 * @returns The processed session model with derived metrics and distribution data.
 */
function processSessions(source: SourceData): Data.Sessions {
  const statistics = source.sessions.statistics;
  const activeDays = calculateActiveDays(source);

  return {
    records: source.sessions.records,
    statistics: {
      count: statistics.count,
      completedCount: statistics.completedCount,
      activeCount: statistics.activeCount,
      totalDuration: statistics.totalDuration,
      averageDuration: statistics.averageDuration,
      medianDuration: statistics.medianDuration,
      longestDuration: statistics.longestDuration,
      shortestDuration: statistics.shortestDuration,
    },

    durationDistribution: source.sessions.durationDistribution.map(
      (distribution) => ({
        label: distribution.label,
        count: distribution.count,
      }),
    ),

    gaps: {
      values: source.sessions.gaps.values,
      average: source.sessions.gaps.average,
      median: source.sessions.gaps.median,
      longest: source.sessions.gaps.longest,
      shortest: source.sessions.gaps.shortest,
      distribution: source.sessions.gaps.distribution.map((distribution) => ({
        label: distribution.label,
        count: distribution.count,
      })),
    },

    evaluations: {
      workContinuityRatio: calculateWorkContinuity(
        source.sessions.records,
        statistics.totalDuration,
      ),
      averageSessionsPerActiveDay: ratio(statistics.count, activeDays),
      averageSessionsPerCalendarDay: calculateAverageSessionsPerCalendarDay(
        source.sessions.records,
        statistics.count,
      ),
      averageRecordedTimePerActiveDay: durationRatio(
        statistics.totalDuration,
        activeDays,
      ),
      averageRecordedTimePerCalendarDay:
        calculateAverageRecordedTimePerCalendarDay(
          source.sessions.records,
          statistics.totalDuration,
        ),
    },
  };
}

/**
 * Maps task data and derives task completion metrics.
 *
 * @param source - The source CTX report data.
 * @returns The processed task model with status summaries and hierarchy data.
 */
function processTasks(source: SourceData): Data.Tasks {
  const statistics = source.tasks.statistics;

  return {
    records: source.tasks.records,
    statistics: {
      count: statistics.count,
      completedCount: statistics.completedCount,
      pendingCount: statistics.pendingCount,
      inProgressCount: statistics.inProgressCount,
      blockedCount: statistics.blockedCount,
      openCount: statistics.openCount,
      rootCount: statistics.rootCount,
      subtaskCount: statistics.subtaskCount,
      maxDepth: statistics.maxDepth,
      averageCompletionDuration: statistics.averageCompletionDuration,
      medianCompletionDuration: statistics.medianCompletionDuration,
      longestCompletionDuration: statistics.longestCompletionDuration,
      shortestCompletionDuration: statistics.shortestCompletionDuration,
    },

    statusDistribution: source.tasks.statusDistribution.map((item) => ({
      status: item.status,
      count: item.count,
    })),

    tree: source.tasks.tree.map(processTaskTreeNode),

    blocked: source.tasks.blocked.map((item) => ({
      taskId: item.taskId,
      reason: item.reason,
    })),
  };
}

/**
 * Recursively maps a task hierarchy node into the report model.
 *
 * @param node - The task tree node from the validated source data.
 * @returns The transformed tree node for UI rendering.
 */
function processTaskTreeNode(
  node: SourceData["tasks"]["tree"][number],
): Data.Tasks.TreeNode {
  return {
    task: node.task,
    children: node.children.map(processTaskTreeNode),
  };
}

/**
 * Maps log data and task-oriented analysis into the report model.
 *
 * @param source - The source CTX report data.
 * @returns The processed log model with statistics and task linkage information.
 */
function processLogs(source: SourceData): Data.Logs {
  const statistics = source.logs.statistics;

  return {
    records: source.logs.records,

    statistics: {
      count: statistics.count,
      unlinkedCount: statistics.unlinkedCount,
      firstTimestamp: statistics.firstTimestamp,
      latestTimestamp: statistics.latestTimestamp,
      byType: {
        note: statistics.byType.note,
        idea: statistics.byType.idea,
        issue: statistics.byType.issue,
        attempt: statistics.byType.attempt,
      },
      issuesCount: statistics.issuesCount,
      attemptsCount: statistics.attemptsCount,
      logsPerSession: statistics.logsPerSession,
      logsPerTask: statistics.logsPerTask,
      tasksWithLogs: statistics.tasksWithLogs,
      tasksWithoutLogs: statistics.tasksWithoutLogs,
    },

    taskAnalysis: {
      mostLoggedTasks: source.logs.taskAnalysis.mostLoggedTasks.map((item) => ({
        taskId: item.taskId,
        count: item.count,
      })),

      tasksWithoutLogs: source.logs.taskAnalysis.tasksWithoutLogs,

      issuesByTask: source.logs.taskAnalysis.issuesByTask.map((item) => ({
        taskId: item.taskId,
        count: item.count,
      })),

      attemptsByTask: source.logs.taskAnalysis.attemptsByTask.map((item) => ({
        taskId: item.taskId,
        count: item.count,
      })),

      repeatedAttempts: source.logs.taskAnalysis.repeatedAttempts.map(
        (item) => ({
          taskId: item.taskId,
          count: item.count,
        }),
      ),
    },
  };
}

/**
 * Maps decision data and reference analysis into the report model.
 *
 * @param source - The source CTX report data.
 * @returns The processed decision model with topic summaries and references.
 */
function processDecisions(source: SourceData): Data.Decisions {
  const statistics = source.decisions.statistics;

  return {
    records: source.decisions.records,

    statistics: {
      count: statistics.count,
      unlinkedCount: statistics.unlinkedCount,
      firstTimestamp: statistics.firstTimestamp,
      latestTimestamp: statistics.latestTimestamp,

      byTopic: statistics.byTopic.map((item) => ({
        topic: item.topic,
        count: item.count,
      })),

      repeatedTopics: statistics.repeatedTopics,
      uncategorizedCount: statistics.uncategorizedCount,

      byTag: statistics.byTag.map((item) => ({
        tag: item.tag,
        count: item.count,
      })),
    },

    references: {
      byType: {
        task: source.decisions.references.byType.task,
        session: source.decisions.references.byType.session,
      },
      tasksWithDecisions: source.decisions.references.tasksWithDecisions,
      sessionsWithDecisions: source.decisions.references.sessionsWithDecisions,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Overview helpers                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Finds the currently active session in the source records.
 *
 * @param sessions - The session records to inspect.
 * @returns The active session, or null when none is currently active.
 */
function findActiveSession(
  sessions: SourceData["sessions"]["records"],
): Data.Sessions.Record | null {
  return sessions.find((session) => session.status === "active") ?? null;
}

/**
 * Counts the distinct local calendar days that contain at least one session.
 *
 * The project's configured timezone is used so the calculation aligns with the project calendar
 * rather than UTC.
 *
 * @param source - The source CTX report data.
 * @returns The number of active local days in the project timeline.
 */
function calculateActiveDays(source: SourceData): number {
  const timezone = source.metadata.project.timezone;

  return new Set(
    source.sessions.records.map((session) =>
      session.startTime.setZone(timezone).toISODate(),
    ),
  ).size;
}

/**
 * Finds the most recent record in a timestamped collection.
 *
 * @template T - The item type. It must include a Luxon DateTime timestamp.
 * @param records - The collection of records to inspect.
 * @returns The latest record by timestamp, or null when the collection is empty.
 */
function latestByTimestamp<T extends { timestamp: DateTime }>(
  records: T[],
): T | null {
  if (records.length === 0) {
    return null;
  }

  return records.reduce((latest, current) =>
    current.timestamp.toMillis() > latest.timestamp.toMillis()
      ? current
      : latest,
  );
}

/**
 * Builds a compact activity feed from persisted project events.
 *
 * The feed intentionally uses actual persisted records only and does not infer additional events
 * such as task progress when those are not represented in the source contract.
 *
 * @param source - The source CTX report data.
 * @returns The most recent project activities in reverse-chronological order.
 */
function buildRecentActivity(source: SourceData): Data.Overview.Activity[] {
  const activities: Data.Overview.Activity[] = [];

  for (const session of source.sessions.records) {
    activities.push({
      timestamp: session.startTime,
      type: "session",
      id: session.id,
      description:
        session.status === "active" ? "Session started" : "Session recorded",
    });
  }

  for (const task of source.tasks.records) {
    activities.push({
      timestamp: task.createdAt,
      type: "task",
      id: task.id,
      description: `Task created: ${task.title}`,
    });

    if (task.completedAt) {
      activities.push({
        timestamp: task.completedAt,
        type: "task",
        id: task.id,
        description: `Task completed: ${task.title}`,
      });
    }
  }

  for (const log of source.logs.records) {
    activities.push({
      timestamp: log.timestamp,
      type: "log",
      id: log.id,
      description: log.note,
    });
  }

  for (const decision of source.decisions.records) {
    activities.push({
      timestamp: decision.timestamp,
      type: "decision",
      id: decision.id,
      description: decision.topic,
    });
  }

  return activities
    .sort(
      (left, right) => right.timestamp.toMillis() - left.timestamp.toMillis(),
    )
    .slice(0, 20);
}

/**
 * Builds the project timeline from persisted events.
 *
 * @param source - The source CTX report data.
 * @returns A timeline representation of the latest project activity records.
 */
function buildTimeline(source: SourceData): Data.Overview.TimelineEvent[] {
  return buildRecentActivity(source).map((activity) => ({
    timestamp: activity.timestamp,
    type: activity.type,
    id: activity.id,
    title: activity.description,
  }));
}

/* -------------------------------------------------------------------------- */
/* Session calculations                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Calculates the ratio of recorded session time to the total elapsed span covered by the session records.
 *
 * A value cannot be calculated when fewer than two sessions are present or when the resulting time span
 * is non-positive.
 *
 * @param sessions - The session records used in the calculation.
 * @param totalDuration - The total recorded session duration.
 * @returns The continuity ratio, or null when it cannot be computed.
 */
function calculateWorkContinuity(
  sessions: SourceData["sessions"]["records"],
  totalDuration: Duration,
): number | null {
  if (sessions.length < 2) {
    return null;
  }

  const first = sessions.reduce((earliest, current) =>
    current.startTime.toMillis() < earliest.startTime.toMillis()
      ? current
      : earliest,
  );

  const last = sessions.reduce((latest, current) => {
    const currentEnd = current.endTime ?? current.startTime;

    const latestEnd = latest.endTime ?? latest.startTime;

    return currentEnd.toMillis() > latestEnd.toMillis() ? current : latest;
  });

  const firstTime = first.startTime.toMillis();
  const lastTime = (last.endTime ?? last.startTime).toMillis();
  const elapsed = lastTime - firstTime;

  if (elapsed <= 0) {
    return null;
  }

  return totalDuration.as("milliseconds") / elapsed;
}

/**
 * Calculates the average number of sessions per day containing activity.
 *
 * @param sessions - The session records to evaluate.
 * @param count - The total number of sessions recorded.
 * @returns The average sessions per calendar day, or null when no valid denominator exists.
 */
function calculateAverageSessionsPerCalendarDay(
  sessions: SourceData["sessions"]["records"],
  count: number,
): number | null {
  if (sessions.length === 0 || count === 0) {
    return null;
  }

  const days = new Set(
    sessions.map((session) => session.startTime.toISODate()),
  );

  return ratio(count, days.size);
}

/**
 * Calculates the average recorded duration per calendar day covered by sessions.
 *
 * @param sessions - The session records to evaluate.
 * @param totalDuration - The total recorded session duration.
 * @returns The average duration per covered day, or null when no sessions exist.
 */
function calculateAverageRecordedTimePerCalendarDay(
  sessions: SourceData["sessions"]["records"],
  totalDuration: Duration,
): Duration | null {
  if (sessions.length === 0) {
    return null;
  }

  const days = new Set(
    sessions.map((session) => session.startTime.toISODate()),
  );

  return durationRatio(totalDuration, days.size);
}

/* -------------------------------------------------------------------------- */
/* Generic calculations                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Calculates a percentage value for a numerator and denominator.
 *
 * @param numerator - The numerator value.
 * @param denominator - The denominator value.
 * @returns The percentage as a number, or null when the denominator is zero or negative.
 */
function percentage(numerator: number, denominator: number): number | null {
  if (denominator <= 0) {
    return null;
  }

  return (numerator / denominator) * 100;
}

/**
 * Calculates a numeric ratio between two values.
 *
 * @param numerator - The numerator value.
 * @param denominator - The denominator value.
 * @returns The ratio, or null when the denominator is zero or negative.
 */
function ratio(numerator: number, denominator: number): number | null {
  if (denominator <= 0) {
    return null;
  }

  return numerator / denominator;
}

/**
 * Divides a duration by a positive numeric value.
 *
 * @param duration - The duration to divide.
 * @param divisor - The positive divisor.
 * @returns The scaled duration, or null when the divisor is not positive.
 */
function durationRatio(duration: Duration, divisor: number): Duration | null {
  if (divisor <= 0) {
    return null;
  }

  return duration.mapUnits((value) => value / divisor);
}

/**
 * Finds the task that is currently marked as in progress.
 *
 * @param tasks - The task records to inspect.
 * @returns The in-progress task, or null when no task is in progress.
 */
function findTaskInProgress(
  tasks: SourceData["tasks"]["records"],
): Data.Tasks.Record | null {
  return tasks.find((task) => task.status === "in-progress") ?? null;
}
