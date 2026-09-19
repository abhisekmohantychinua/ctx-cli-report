/** Shape of the semi-computed context payload emitted by CTX CLI. */
export interface RawReportData {
  metadata: RawMetadata;
  sessions: RawSessions;
  tasks: RawTasks;
  logs: RawLogs;
  decisions: RawDecisions;
  activity: RawActivity;
  integrity: RawIntegrity;
}

/** Project metadata and the time range covered by the source data. */
export interface RawMetadata {
  project: RawProjectMetadata;
  ctxVersion: string;
  timezone: string;
  dataRange: RawDataRange;
  generatedAt: Date;
  reportVersion: string;
}

/** Identifies the project that produced the report. */
export interface RawProjectMetadata {
  name: string;
  root: string;
  createdAt: string;
}

/** First and last activity timestamps available in the source data. */
export interface RawDataRange {
  firstActivity: string;
  lastActivity: string;
}

/** Session records and CTX-provided session aggregations. */
export interface RawSessions {
  records: RawSession[];
  statistics: RawSessionStatistics;
  durationDistribution: RawDistributionBucket[];
  activity: RawSessionActivity;
  gaps: RawSessionGaps;
}

/** A recorded work session. */
export interface RawSession {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  note: string | null;
  environment: string;
  status: string;
  taskIds: string[];
}

/** Summary counts and duration statistics for sessions. */
export interface RawSessionStatistics {
  count: number;
  completedCount: number;
  activeCount: number;
  totalDuration: number;
  averageDuration: number;
  medianDuration: number;
  longestDuration: number;
  shortestDuration: number;
}

/** A labeled count bucket used by distribution charts. */
export interface RawDistributionBucket {
  label: string;
  count: number;
}

/** Session activity grouped by date, hour, and day of week. */
export interface RawSessionActivity {
  firstStart: string;
  latestEnd: string;
  calendarDays: number;
  activeDays: number;
  inactiveDays: number;
  dailyCounts: RawDailyCount[];
  dailyDurations: RawDailyDuration[];
  startByHour: RawHourlyCount[];
  startByDayOfWeek: RawDayOfWeekCount[];
  averageStartTime: string;
  peakStartHour: number;
}

/** A count associated with a calendar date. */
export interface RawDailyCount {
  date: string;
  count: number;
}

/** A duration associated with a calendar date. */
export interface RawDailyDuration {
  date: string;
  duration: number;
}

/** A count associated with an hour of the day. */
export interface RawHourlyCount {
  hour: number;
  count: number;
}

/** A count associated with a named day of the week. */
export interface RawDayOfWeekCount {
  day: string;
  count: number;
}

/** Time gaps between sessions and their distribution. */
export interface RawSessionGaps {
  values: number[];
  average: number;
  median: number;
  longest: number;
  shortest: number;
  distribution: RawDistributionBucket[];
}

/** Task records and CTX-provided task aggregations. */
export interface RawTasks {
  records: RawTask[];
  statistics: RawTaskStatistics;
  statusDistribution: RawTaskStatusDistribution[];
  activity: RawTaskActivity;
  hierarchy: RawTaskHierarchy;
  blocked: RawBlockedTask[];
}

/** A task tracked by CTX CLI. */
export interface RawTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  parentId: string | null;
  createdAt: string;
  completedAt: string | null;
  completionDuration: number | null;
  blockReason: string | null;
  sessionId: string | null;
  subtaskCount: number;
  logCount: number;
  decisionCount: number;
  lastActivity: string;
}

/** Summary counts and completion-duration statistics for tasks. */
export interface RawTaskStatistics {
  count: number;
  completedCount: number;
  pendingCount: number;
  inProgressCount: number;
  blockedCount: number;
  openCount: number;
  rootCount: number;
  subtaskCount: number;
  maxDepth: number;
  averageCompletionDuration: number | null;
  medianCompletionDuration: number | null;
  longestCompletionDuration: number | null;
  shortestCompletionDuration: number | null;
}

/** Number of tasks in a particular status. */
export interface RawTaskStatusDistribution {
  status: string;
  count: number;
}

/** Task creation and completion activity grouped by date. */
export interface RawTaskActivity {
  createdByDay: RawDailyCount[];
  completedByDay: RawDailyCount[];
}

/** Parent-child relationships and hierarchy integrity findings. */
export interface RawTaskHierarchy {
  tree: RawTaskTreeNode[];
  orphans: string[];
  cycles: string[];
}

export interface RawTaskTreeNode {
  taskId: string;
  children: string[];
}

/** A task that CTX identified as blocked. */
export interface RawBlockedTask {
  taskId: string;
  reason: string;
}

/** Log records and CTX-provided log aggregations. */
export interface RawLogs {
  records: RawLog[];
  statistics: RawLogStatistics;
  activity: RawLogActivity;
  taskAnalysis: RawLogTaskAnalysis;
  invalidReferences: RawInvalidReference[];
}

/** A single timestamped log entry. */
export interface RawLog {
  id: string;
  timestamp: string;
  message: string;
  type: string;
  sessionId: string | null;
  taskId: string | null;
}

/** Summary counts and linkability statistics for logs. */
export interface RawLogStatistics {
  count: number;
  unlinkedCount: number;
  firstTimestamp: string;
  latestTimestamp: string;
  byType: Record<string, number>;
  issuesCount: number;
  attemptsCount: number;
  logsPerSession: number | null;
  logsPerTask: number | null;
  tasksWithLogs: number;
  tasksWithoutLogs: number;
}

/** Log activity grouped by date and hour. */
export interface RawLogActivity {
  byDay: RawDailyCount[];
  byHour: RawHourlyCount[];
}

/** Task-level log counts and repeated-attempt analysis. */
export interface RawLogTaskAnalysis {
  mostLoggedTasks: RawTaskLogCount[];
  tasksWithoutLogs: string[];
  issuesByTask: RawTaskLogCount[];
  attemptsByTask: RawTaskLogCount[];
  repeatedAttempts: RawRepeatedAttempt[];
}

/** A log count associated with a task. */
export interface RawTaskLogCount {
  taskId: string;
  count: number;
}

/** Number of repeated attempts recorded for a task. */
export interface RawRepeatedAttempt {
  taskId: string;
  count: number;
}

/** An invalid entity reference reported by CTX. */
export interface RawInvalidReference {
  type: string;
  id: string;
}

/** Decision records and CTX-provided decision aggregations. */
export interface RawDecisions {
  records: RawDecision[];
  statistics: RawDecisionStatistics;
  references: RawDecisionReferences;
  activity: RawDecisionActivity;
}

/** A recorded decision and its optional entity reference. */
export interface RawDecision {
  id: string;
  topic: string;
  reasoning: string;
  tags: string[];
  timestamp: string;
  reference: RawDecisionReference | null;
}

/** A reference from a decision to another CTX entity. */
export interface RawDecisionReference {
  type: string;
  id: string;
}

/** Summary counts, topic breakdowns, and tag breakdowns for decisions. */
export interface RawDecisionStatistics {
  count: number;
  unlinkedCount: number;
  firstTimestamp: string;
  latestTimestamp: string;
  byTopic: RawTopicCount[];
  repeatedTopics: string[];
  uncategorizedCount: number;
  byTag: RawTagCount[];
}

/** Number of decisions associated with a topic. */
export interface RawTopicCount {
  topic: string;
  count: number;
}

/** Number of decisions associated with a tag. */
export interface RawTagCount {
  tag: string;
  count: number;
}

/** Decision references grouped by entity type and integrity state. */
export interface RawDecisionReferences {
  byType: Record<string, number>;
  tasksWithDecisions: string[];
  sessionsWithDecisions: string[];
  invalid: RawInvalidReference[];
}

/** Decision activity grouped by date. */
export interface RawDecisionActivity {
  byDay: RawDailyCount[];
}

/** Overview activity records and chronological timeline events. */
export interface RawActivity {
  recent: RawActivityRecord[];
  timeline: RawTimelineEvent[];
}

/** A human-readable recent activity entry. */
export interface RawActivityRecord {
  timestamp: string;
  type: string;
  id: string;
  taskId: string | null;
  sessionId: string | null;
  message: string;
}

/** A compact event used to build the report timeline. */
export interface RawTimelineEvent {
  timestamp: string;
  type: string;
  id: string;
}

/** Integrity findings produced while CTX assembled the source payload. */
export interface RawIntegrity {
  valid: boolean;
  invalidTimestamps: string[];
  invalidReferences: RawInvalidReference[];
  invalidParentReferences: RawInvalidReference[];
  orphanTasks: string[];
  cyclicTasks: string[];
  missingRequiredFields: string[];
  limitations: string[];
}
