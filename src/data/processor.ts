import type {
  RawDecisionReferences,
  RawDecisionStatistics,
  RawLogActivity,
  RawLogStatistics,
  RawLogTaskAnalysis,
  RawReportData,
  RawSession,
  RawSessionActivity,
  RawSessionGaps,
  RawSessionStatistics,
  RawTask,
  RawTaskActivity,
  RawTaskHierarchy,
} from "./models/raw";

import type {
  ReportData,
  ReportDecisions,
  ReportDecisionActivity,
  ReportDecisionReferences,
  ReportDecisionStatistics,
  ReportLogs,
  ReportLogActivity,
  ReportLogStatistics,
  ReportLogTaskAnalysis,
  ReportMetadata,
  ReportOverview,
  ReportSessions,
  ReportSessionActivity,
  ReportSessionGaps,
  ReportSessionStatistics,
  ReportTasks,
  ReportTaskActivity,
  ReportTaskHierarchy,
  ReportTaskStatistics,
} from "./models/report";

/** Optional metadata overrides used when constructing a processed report. */
export interface ProcessorOptions {
  generatedAt?: string;
  reportVersion?: string;
}

/**
 * Converts CTX's semi-computed report input into the page-oriented report model.
 *
 * CTX is responsible for querying, joining, filtering, sorting and aggregating
 * project data. This processor only maps those values and performs lightweight
 * arithmetic required by the report.
 * @param raw CTX-generated input data.
 * @param options Optional report metadata overrides.
 * @returns The normalized model consumed by report pages.
 */
export function processReport(
  raw: RawReportData,
  options: ProcessorOptions = {},
): ReportData {
  return {
    metadata: processMetadata(raw, options),
    overview: processOverview(raw),
    sessions: processSessions(raw),
    tasks: processTasks(raw),
    logs: processLogs(raw),
    decisions: processDecisions(raw),
  };
}

/** Maps source metadata and supplies report-generation metadata. */
function processMetadata(
  raw: RawReportData,
  options: ProcessorOptions,
): ReportMetadata {
  return {
    project: {
      name: raw.metadata.project.name,
      root: raw.metadata.project.root,
      createdAt: raw.metadata.project.createdAt,
    },
    ctxVersion: raw.metadata.ctxVersion,
    timezone: raw.metadata.timezone,
    dataRange: {
      firstActivity: raw.metadata.dataRange.firstActivity,
      lastActivity: raw.metadata.dataRange.lastActivity,
    },
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    reportVersion: options.reportVersion ?? "1",
  };
}

/** Builds overview metrics and identifies the current report state. */
function processOverview(raw: RawReportData): ReportOverview {
  const activeSession =
    raw.sessions.records.find((session) => session.status === "active") ?? null;

  const activeTask = findActiveTask(raw.tasks.records, activeSession);

  return {
    metrics: {
      sessions: raw.sessions.statistics.count,
      recordedDuration: raw.sessions.statistics.totalDuration,
      activeDays: raw.sessions.activity.activeDays,

      tasks: raw.tasks.statistics.count,
      completedTasks: raw.tasks.statistics.completedCount,
      inProgressTasks: raw.tasks.statistics.inProgressCount,
      blockedTasks: raw.tasks.statistics.blockedCount,
      pendingTasks: raw.tasks.statistics.pendingCount,

      logs: raw.logs.statistics.count,
      decisions: raw.decisions.statistics.count,

      taskCompletionRate: percentage(
        raw.tasks.statistics.completedCount,
        raw.tasks.statistics.count,
      ),
      taskOpenRate: percentage(
        raw.tasks.statistics.openCount,
        raw.tasks.statistics.count,
      ),
    },
    currentState: {
      activeSession,
      activeTask,
      pendingTaskCount: raw.tasks.statistics.pendingCount,
      blockedTaskCount: raw.tasks.statistics.blockedCount,
      latestLog: latestByTimestamp(raw.logs.records),
      latestDecision: latestByTimestamp(raw.decisions.records),
    },
    recentActivity: raw.activity.recent,
    timeline: raw.activity.timeline,
  };
}

/** Maps session data and derives report-side session evaluations. */
function processSessions(raw: RawReportData): ReportSessions {
  const statistics = raw.sessions.statistics;
  const activity = raw.sessions.activity;
  const gaps = raw.sessions.gaps;

  return {
    records: raw.sessions.records,
    statistics: processSessionStatistics(statistics),
    durationDistribution: raw.sessions.durationDistribution,
    activity: processSessionActivity(activity),
    gaps: processSessionGaps(gaps),
    evaluations: {
      workContinuityRatio: calculateWorkContinuityRatio(
        statistics.totalDuration,
        raw.metadata.dataRange.firstActivity,
        raw.metadata.dataRange.lastActivity,
      ),
      averageSessionsPerActiveDay: ratio(statistics.count, activity.activeDays),
      averageSessionsPerCalendarDay: ratio(
        statistics.count,
        activity.calendarDays,
      ),
      averageRecordedTimePerActiveDay: ratio(
        statistics.totalDuration,
        activity.activeDays,
      ),
      averageRecordedTimePerCalendarDay: ratio(
        statistics.totalDuration,
        activity.calendarDays,
      ),
    },
  };
}

/** Copies the CTX session statistics into the report contract. */
function processSessionStatistics(
  statistics: RawSessionStatistics,
): ReportSessionStatistics {
  return {
    count: statistics.count,
    completedCount: statistics.completedCount,
    activeCount: statistics.activeCount,
    totalDuration: statistics.totalDuration,
    averageDuration: statistics.averageDuration,
    medianDuration: statistics.medianDuration,
    longestDuration: statistics.longestDuration,
    shortestDuration: statistics.shortestDuration,
  };
}

/** Converts raw chart values into the report's shared value format. */
function processSessionActivity(
  activity: RawSessionActivity,
): ReportSessionActivity {
  return {
    firstStart: activity.firstStart,
    latestEnd: activity.latestEnd,
    calendarDays: activity.calendarDays,
    activeDays: activity.activeDays,
    inactiveDays: activity.inactiveDays,
    dailyCounts: activity.dailyCounts.map((item) => ({
      date: item.date,
      value: item.count,
    })),
    dailyDurations: activity.dailyDurations.map((item) => ({
      date: item.date,
      value: item.duration,
    })),
    startByHour: activity.startByHour.map((item) => ({
      label: String(item.hour),
      count: item.count,
    })),
    startByDayOfWeek: activity.startByDayOfWeek.map((item) => ({
      label: item.day,
      count: item.count,
    })),
    averageStartTime: activity.averageStartTime,
    peakStartHour: activity.peakStartHour,
  };
}

/** Copies session gap statistics for report display. */
function processSessionGaps(gaps: RawSessionGaps): ReportSessionGaps {
  return {
    values: gaps.values,
    average: gaps.average,
    median: gaps.median,
    longest: gaps.longest,
    shortest: gaps.shortest,
    distribution: gaps.distribution,
  };
}

/** Maps task data and calculates percentages for each task status. */
function processTasks(raw: RawReportData): ReportTasks {
  return {
    records: raw.tasks.records,
    statistics: processTaskStatistics(raw.tasks.statistics),
    statusDistribution: raw.tasks.statusDistribution,
    activity: processTaskActivity(raw.tasks.activity),
    hierarchy: processTaskHierarchy(raw.tasks.hierarchy),
    blocked: raw.tasks.blocked,
    evaluations: {
      completionRate: percentage(
        raw.tasks.statistics.completedCount,
        raw.tasks.statistics.count,
      ),
      pendingRate: percentage(
        raw.tasks.statistics.pendingCount,
        raw.tasks.statistics.count,
      ),
      inProgressRate: percentage(
        raw.tasks.statistics.inProgressCount,
        raw.tasks.statistics.count,
      ),
      blockedRate: percentage(
        raw.tasks.statistics.blockedCount,
        raw.tasks.statistics.count,
      ),
      openRate: percentage(
        raw.tasks.statistics.openCount,
        raw.tasks.statistics.count,
      ),
    },
  };
}

/** Copies task statistics without recomputing CTX-owned aggregates. */
function processTaskStatistics(
  statistics: RawReportData["tasks"]["statistics"],
): ReportTaskStatistics {
  return {
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
  };
}

/** Converts task activity counts to the report's shared value format. */
function processTaskActivity(activity: RawTaskActivity): ReportTaskActivity {
  return {
    createdByDay: activity.createdByDay.map((item) => ({
      date: item.date,
      value: item.count,
    })),
    completedByDay: activity.completedByDay.map((item) => ({
      date: item.date,
      value: item.count,
    })),
  };
}

/** Copies hierarchy findings while preserving CTX's relationship analysis. */
function processTaskHierarchy(
  hierarchy: RawTaskHierarchy,
): ReportTaskHierarchy {
  return {
    tree: hierarchy.tree,
    orphans: hierarchy.orphans,
    cycles: hierarchy.cycles,
  };
}

/** Maps log data and derives log distribution and density measures. */
function processLogs(raw: RawReportData): ReportLogs {
  const statistics = raw.logs.statistics;

  return {
    records: raw.logs.records,
    statistics: processLogStatistics(statistics),
    activity: processLogActivity(raw.logs.activity),
    taskAnalysis: processLogTaskAnalysis(raw.logs.taskAnalysis),
    invalidReferences: raw.logs.invalidReferences,
    evaluations: {
      typePercentages: percentages(statistics.byType, statistics.count),
      issuePercentage: percentage(statistics.issuesCount, statistics.count),
      attemptPercentage: percentage(statistics.attemptsCount, statistics.count),
      issueWithoutAttemptPercentage: calculateIssueWithoutAttemptPercentage(
        raw.logs.taskAnalysis,
        statistics.issuesCount,
      ),
      logsPerRecordedHour: calculateLogsPerRecordedHour(
        statistics.count,
        raw.sessions.statistics.totalDuration,
      ),
    },
  };
}

/** Copies CTX-provided log statistics into the report contract. */
function processLogStatistics(
  statistics: RawLogStatistics,
): ReportLogStatistics {
  return {
    count: statistics.count,
    unlinkedCount: statistics.unlinkedCount,
    firstTimestamp: statistics.firstTimestamp,
    latestTimestamp: statistics.latestTimestamp,
    byType: { ...statistics.byType },
    issuesCount: statistics.issuesCount,
    attemptsCount: statistics.attemptsCount,
    logsPerSession: statistics.logsPerSession,
    logsPerTask: statistics.logsPerTask,
    tasksWithLogs: statistics.tasksWithLogs,
    tasksWithoutLogs: statistics.tasksWithoutLogs,
  };
}

/** Converts log activity counts to the report's shared value format. */
function processLogActivity(activity: RawLogActivity): ReportLogActivity {
  return {
    byDay: activity.byDay.map((item) => ({
      date: item.date,
      value: item.count,
    })),
    byHour: activity.byHour.map((item) => ({
      label: String(item.hour),
      count: item.count,
    })),
  };
}

/** Renames task identifiers to the generic report count-by-ID shape. */
function processLogTaskAnalysis(
  analysis: RawLogTaskAnalysis,
): ReportLogTaskAnalysis {
  return {
    mostLoggedTasks: analysis.mostLoggedTasks.map((item) => ({
      id: item.taskId,
      count: item.count,
    })),
    tasksWithoutLogs: analysis.tasksWithoutLogs,
    issuesByTask: analysis.issuesByTask.map((item) => ({
      id: item.taskId,
      count: item.count,
    })),
    attemptsByTask: analysis.attemptsByTask.map((item) => ({
      id: item.taskId,
      count: item.count,
    })),
    repeatedAttempts: analysis.repeatedAttempts,
  };
}

/** Maps decision data and derives topic, tag, and reference measures. */
function processDecisions(raw: RawReportData): ReportDecisions {
  const statistics = raw.decisions.statistics;

  return {
    records: raw.decisions.records,
    statistics: processDecisionStatistics(statistics),
    references: processDecisionReferences(raw.decisions.references),
    activity: processDecisionActivity(raw.decisions.activity),
    evaluations: {
      topicPercentages: percentages(
        toCountRecord(statistics.byTopic, (item) => item.topic),
        statistics.count,
      ),
      tagPercentages: percentages(
        toCountRecord(statistics.byTag, (item) => item.tag),
        statistics.count,
      ),
      decisionsPerTask: ratio(statistics.count, raw.tasks.statistics.count),
      decisionsPerSession: ratio(
        statistics.count,
        raw.sessions.statistics.count,
      ),
      topTopicShare: calculateTopTopicShare(statistics),
    },
  };
}

/** Copies CTX-provided decision statistics into the report contract. */
function processDecisionStatistics(
  statistics: RawDecisionStatistics,
): ReportDecisionStatistics {
  return {
    count: statistics.count,
    unlinkedCount: statistics.unlinkedCount,
    firstTimestamp: statistics.firstTimestamp,
    latestTimestamp: statistics.latestTimestamp,
    byTopic: statistics.byTopic,
    repeatedTopics: statistics.repeatedTopics,
    uncategorizedCount: statistics.uncategorizedCount,
    byTag: statistics.byTag,
  };
}

/** Copies decision reference indexes while preserving their entity IDs. */
function processDecisionReferences(
  references: RawDecisionReferences,
): ReportDecisionReferences {
  return {
    byType: { ...references.byType },
    tasksWithDecisions: references.tasksWithDecisions,
    sessionsWithDecisions: references.sessionsWithDecisions,
    invalid: references.invalid,
  };
}

/** Converts decision activity counts to the report's shared value format. */
function processDecisionActivity(
  activity: RawReportData["decisions"]["activity"],
): ReportDecisionActivity {
  return {
    byDay: activity.byDay.map((item) => ({
      date: item.date,
      value: item.count,
    })),
  };
}

/* Lightweight calculations. CTX owns the expensive aggregation work. */

/** Divides two values, returning zero when the denominator is not positive. */
function ratio(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }

  return numerator / denominator;
}

/** Expresses a ratio as a percentage while retaining full precision. */
function percentage(numerator: number, denominator: number): number {
  const value = ratio(numerator, denominator);

  return value * 100;
}

/** Converts a keyed count map into percentages of a supplied total. */
function percentages(
  counts: Record<string, number>,
  total: number,
): Record<string, number> {
  if (total <= 0) {
    return Object.fromEntries(Object.keys(counts).map((key) => [key, 0]));
  }

  return Object.fromEntries(
    Object.entries(counts).map(([key, count]) => [key, (count / total) * 100]),
  );
}

/** Converts counted values into a lookup keyed by a selected field. */
function toCountRecord<T>(
  values: T[],
  key: (value: T) => string,
): Record<string, number> {
  return Object.fromEntries(
    values.map((value) => [key(value), (value as T & { count: number }).count]),
  );
}

/**
 * Measures recorded time against the elapsed source-data span.
 *
 * Invalid or non-positive spans cannot produce a meaningful continuity ratio,
 * so they are represented as null for the UI to handle explicitly.
 */
function calculateWorkContinuityRatio(
  totalRecordedDuration: number,
  firstActivity: string,
  lastActivity: string,
): number | null {
  const start = Date.parse(firstActivity);
  const end = Date.parse(lastActivity);

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return null;
  }

  return totalRecordedDuration / ((end - start) / 1000);
}

/** Calculates log density using recorded seconds converted to hours. */
function calculateLogsPerRecordedHour(
  logCount: number,
  recordedDuration: number,
): number | null {
  return ratio(logCount, recordedDuration / 3600);
}

/**
 * Estimates issue coverage by comparing task IDs with and without attempts.
 * CTX exposes task-level counts, so this is intentionally task-based rather
 * than a claim about individual issue log entries.
 */
function calculateIssueWithoutAttemptPercentage(
  analysis: RawLogTaskAnalysis,
  issueCount: number,
): number | null {
  if (issueCount <= 0) {
    return null;
  }

  const attemptedTaskIds = new Set(
    analysis.attemptsByTask.map((item) => item.taskId),
  );

  const issueTaskIds = new Set(
    analysis.issuesByTask.map((item) => item.taskId),
  );

  let issuesWithoutAttempt = 0;

  for (const taskId of issueTaskIds) {
    if (!attemptedTaskIds.has(taskId)) {
      issuesWithoutAttempt++;
    }
  }

  return (issuesWithoutAttempt / issueCount) * 100;
}

/** Returns the share of all decisions represented by the busiest topic. */
function calculateTopTopicShare(
  statistics: RawDecisionStatistics,
): number | null {
  if (statistics.count <= 0 || statistics.byTopic.length === 0) {
    return null;
  }

  const topCount = Math.max(...statistics.byTopic.map((item) => item.count));

  return (topCount / statistics.count) * 100;
}

/* Small mapping helpers. */

/** Finds the in-progress task attached to the active session, if any. */
function findActiveTask(
  tasks: RawTask[],
  activeSession: RawSession | null,
): RawTask | null {
  if (!activeSession) {
    return null;
  }

  const sessionTaskIds = new Set(activeSession.taskIds);

  return (
    tasks.find(
      (task) => sessionTaskIds.has(task.id) && task.status === "in-progress",
    ) ?? null
  );
}

/** Returns the record with the lexicographically latest timestamp. */
function latestByTimestamp<T extends { timestamp: string }>(
  records: T[],
): T | null {
  if (records.length === 0) {
    return null;
  }

  let latest = records[0];

  for (let index = 1; index < records.length; index++) {
    if (records[index].timestamp > latest.timestamp) {
      latest = records[index];
    }
  }

  return latest;
}
