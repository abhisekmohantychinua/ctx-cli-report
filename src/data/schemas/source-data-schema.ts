import { DateTime, Duration } from "luxon";
import { z } from "zod";

/**
 * ISO-8601 instant serialized by the CTX CLI.
 *
 * <p>The JSON representation is an ISO-8601 timestamp. After parsing, the
 * value is represented as a Luxon {@link DateTime} with its instant preserved.
 *
 * <p>The CTX CLI uses Java {@code Instant}, which represents an absolute point
 * in time independent of a timezone. Luxon {@code DateTime} is therefore used
 * as the runtime representation.
 */
const InstantSchema = z.iso
  .datetime({
    offset: true,
  })
  .transform((value) => {
    const dateTime = DateTime.fromISO(value, { setZone: true });

    if (!dateTime.isValid) {
      throw new Error(`Invalid ISO-8601 instant: ${value}`);
    }

    return dateTime.toUTC();
  });

/**
 * ISO-8601 duration serialized by the CTX CLI.
 *
 * <p>The JSON representation is an ISO-8601 duration. After parsing, the
 * value is represented as a Luxon {@link Duration}.
 *
 * <p>This corresponds to the Java {@code java.time.Duration} values used by
 * the CTX CLI report contract.
 */
const DurationSchema = z.string().transform((value) => {
  const duration = Duration.fromISO(value);

  if (!duration.isValid) {
    throw new Error(`Invalid ISO-8601 duration: ${value}`);
  }

  return duration;
});

/**
 * Represents a reference from one report record to another project entity.
 */
const ReferenceSchema = z
  .object({
    type: z.string(),
    id: z.string(),
  })
  .strict();

/**
 * Represents project-level metadata.
 */
const MetadataProjectSchema = z
  .object({
    name: z.string(),
    root: z.string(),
    createdAt: InstantSchema,
    version: z.string(),
    timezone: z.string(),
    dateTimeTemplate: z.string(),
  })
  .strict();

/**
 * Represents report metadata.
 */
const MetadataSchema = z
  .object({
    project: MetadataProjectSchema,
    generatedAt: InstantSchema,
    reportVersion: z.string(),
  })
  .strict();

/**
 * Represents one project session.
 */
const SessionRecordSchema = z
  .object({
    id: z.string(),
    startTime: InstantSchema,
    endTime: InstantSchema.nullable(),
    duration: DurationSchema,
    note: z.string().nullable(),
    status: z.string(),
  })
  .strict();

/**
 * Contains aggregate measurements calculated from project sessions.
 */
const SessionStatisticsSchema = z
  .object({
    count: z.number().int().nonnegative(),
    completedCount: z.number().int().nonnegative(),
    activeCount: z.number().int().nonnegative(),
    totalDuration: DurationSchema,
    averageDuration: DurationSchema,
    medianDuration: DurationSchema,
    longestDuration: DurationSchema,
    shortestDuration: DurationSchema,
  })
  .strict();

/**
 * Represents the number of sessions belonging to a duration range.
 */
const DurationDistributionSchema = z
  .object({
    label: z.string(),
    count: z.number().int().nonnegative(),
  })
  .strict();

/**
 * Contains gaps between consecutive sessions and their aggregate measurements.
 */
const SessionGapsSchema = z
  .object({
    values: z.array(DurationSchema),
    average: DurationSchema,
    median: DurationSchema,
    longest: DurationSchema,
    shortest: DurationSchema,
    distribution: z.array(DurationDistributionSchema),
  })
  .strict();

/**
 * Represents all session-related report data.
 */
const SessionsSchema = z
  .object({
    records: z.array(SessionRecordSchema),
    statistics: SessionStatisticsSchema,
    durationDistribution: z.array(DurationDistributionSchema),
    gaps: SessionGapsSchema,
  })
  .strict();

/**
 * Represents one resolved task.
 */
const TaskRecordSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    status: z.string(),
    createdAt: InstantSchema,
    completedAt: InstantSchema.nullable(),
    completionDuration: DurationSchema.nullable(),
    blockReason: z.string().nullable(),
    subtaskCount: z.number().int().nonnegative(),
  })
  .strict();

/**
 * Contains aggregate measurements calculated from resolved tasks.
 */
const TaskStatisticsSchema = z
  .object({
    count: z.number().int().nonnegative(),
    completedCount: z.number().int().nonnegative(),
    pendingCount: z.number().int().nonnegative(),
    inProgressCount: z.number().int().nonnegative(),
    blockedCount: z.number().int().nonnegative(),
    openCount: z.number().int().nonnegative(),
    rootCount: z.number().int().nonnegative(),
    subtaskCount: z.number().int().nonnegative(),
    maxDepth: z.number().int().nonnegative(),
    averageCompletionDuration: DurationSchema,
    medianCompletionDuration: DurationSchema,
    longestCompletionDuration: DurationSchema,
    shortestCompletionDuration: DurationSchema,
  })
  .strict();

/**
 * Represents the number of tasks having a particular status.
 */
const TaskStatusDistributionSchema = z
  .object({
    status: z.string(),
    count: z.number().int().nonnegative(),
  })
  .strict();

/**
 * Represents one node in the resolved task hierarchy.
 */
type TaskTreeNode = {
  task: z.infer<typeof TaskRecordSchema>;
  children: TaskTreeNode[];
};

const TaskTreeNodeSchema: z.ZodType<TaskTreeNode> = z.lazy(() =>
  z
    .object({
      task: TaskRecordSchema,
      children: z.array(TaskTreeNodeSchema),
    })
    .strict(),
);

/**
 * Represents a task currently having a blocked status.
 */
const BlockedTaskSchema = z
  .object({
    taskId: z.string(),
    reason: z.string(),
  })
  .strict();

/**
 * Represents all task-related report data.
 */
const TasksSchema = z
  .object({
    records: z.array(TaskRecordSchema),
    statistics: TaskStatisticsSchema,
    statusDistribution: z.array(TaskStatusDistributionSchema),
    tree: z.array(TaskTreeNodeSchema),
    blocked: z.array(BlockedTaskSchema),
  })
  .strict();

/**
 * Represents one persisted log entry.
 */
const LogRecordSchema = z
  .object({
    id: z.string(),
    timestamp: InstantSchema,
    note: z.string(),
    type: z.string(),
    reference: ReferenceSchema.nullable(),
  })
  .strict();

/**
 * Contains the number of logs grouped by type.
 */
const LogTypeStatisticsSchema = z
  .object({
    note: z.number().int().nonnegative(),
    idea: z.number().int().nonnegative(),
    issue: z.number().int().nonnegative(),
    attempt: z.number().int().nonnegative(),
  })
  .strict();

/**
 * Contains aggregate measurements calculated from logs.
 */
const LogStatisticsSchema = z
  .object({
    count: z.number().int().nonnegative(),
    unlinkedCount: z.number().int().nonnegative(),
    firstTimestamp: InstantSchema.nullable(),
    latestTimestamp: InstantSchema.nullable(),
    byType: LogTypeStatisticsSchema,
    issuesCount: z.number().int().nonnegative(),
    attemptsCount: z.number().int().nonnegative(),
    logsPerSession: z.number().nonnegative(),
    logsPerTask: z.number().nonnegative(),
    tasksWithLogs: z.number().int().nonnegative(),
    tasksWithoutLogs: z.number().int().nonnegative(),
  })
  .strict();

/**
 * Represents the number of logs associated with a task.
 */
const TaskLogCountSchema = z
  .object({
    taskId: z.string(),
    count: z.number().int().nonnegative(),
  })
  .strict();

/**
 * Represents a task having multiple attempt logs.
 */
const RepeatedAttemptSchema = z
  .object({
    taskId: z.string(),
    count: z.number().int().positive(),
  })
  .strict();

/**
 * Contains task-oriented analysis derived from logs.
 */
const LogTaskAnalysisSchema = z
  .object({
    mostLoggedTasks: z.array(TaskLogCountSchema),
    tasksWithoutLogs: z.array(z.string()),
    issuesByTask: z.array(TaskLogCountSchema),
    attemptsByTask: z.array(TaskLogCountSchema),
    repeatedAttempts: z.array(RepeatedAttemptSchema),
  })
  .strict();

/**
 * Represents all log-related report data.
 */
const LogsSchema = z
  .object({
    records: z.array(LogRecordSchema),
    statistics: LogStatisticsSchema,
    taskAnalysis: LogTaskAnalysisSchema,
  })
  .strict();

/**
 * Represents one persisted project decision.
 */
const DecisionRecordSchema = z
  .object({
    id: z.string(),
    topic: z.string(),
    reasoning: z.string(),
    tags: z.array(z.string()),
    timestamp: InstantSchema,
    reference: ReferenceSchema.nullable(),
  })
  .strict();

/**
 * Represents the number of decisions associated with a topic.
 */
const DecisionTopicCountSchema = z
  .object({
    topic: z.string(),
    count: z.number().int().positive(),
  })
  .strict();

/**
 * Represents the number of decisions associated with a tag.
 */
const DecisionTagCountSchema = z
  .object({
    tag: z.string(),
    count: z.number().int().positive(),
  })
  .strict();

/**
 * Contains aggregate measurements calculated from decisions.
 */
const DecisionStatisticsSchema = z
  .object({
    count: z.number().int().nonnegative(),
    unlinkedCount: z.number().int().nonnegative(),
    firstTimestamp: InstantSchema.nullable(),
    latestTimestamp: InstantSchema.nullable(),
    byTopic: z.array(DecisionTopicCountSchema),
    repeatedTopics: z.array(z.string()),
    uncategorizedCount: z.number().int().nonnegative(),
    byTag: z.array(DecisionTagCountSchema),
  })
  .strict();

/**
 * Contains the number of decision references grouped by entity type.
 */
const DecisionReferenceCountsSchema = z
  .object({
    task: z.number().int().nonnegative(),
    session: z.number().int().nonnegative(),
  })
  .strict();

/**
 * Contains information about decision references.
 */
const DecisionReferencesSchema = z
  .object({
    byType: DecisionReferenceCountsSchema,
    tasksWithDecisions: z.array(z.string()),
    sessionsWithDecisions: z.array(z.string()),
  })
  .strict();

/**
 * Represents all decision-related report data.
 */
const DecisionsSchema = z
  .object({
    records: z.array(DecisionRecordSchema),
    statistics: DecisionStatisticsSchema,
    references: DecisionReferencesSchema,
  })
  .strict();

/**
 * Runtime schema for the complete report generated by CTX CLI.
 *
 * <p>The schema accepts the JSON representation produced by the Java report
 * generator and transforms Java {@code Instant} and {@code Duration}
 * representations into Luxon runtime objects.
 */
export const SourceDataSchema = z
  .object({
    metadata: MetadataSchema,
    sessions: SessionsSchema,
    tasks: TasksSchema,
    logs: LogsSchema,
    decisions: DecisionsSchema,
  })
  .strict();
