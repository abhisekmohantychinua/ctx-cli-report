import type { DateTime, Duration } from "luxon";

/**
 * Represents the complete data model consumed by the report pages.
 *
 * <p>This model is derived from the validated CTX report contract and is
 * organized around the information presented by the generated report rather
 * than around the structure of the source JSON.
 *
 * <p>It intentionally contains only values that can be derived reliably from
 * the validated CTX data. It does not attempt to infer historical state,
 * productivity, quality, causation, or other information that the source
 * contract does not preserve.
 */
export interface Data {
  metadata: Data.Metadata;
  overview: Data.Overview;
  sessions: Data.Sessions;
  tasks: Data.Tasks;
  logs: Data.Logs;
  decisions: Data.Decisions;
}

/**
 * Namespace containing all models used by {@link Data}.
 */
export namespace Data {
  /**
   * Contains project and report-level metadata.
   */
  export interface Metadata {
    project: Metadata.Project;
    ctxVersion: string;
    generatedAt: DateTime;
    reportVersion: string;
  }

  export namespace Metadata {
    /**
     * Identifies the project from which the report was generated.
     */
    export interface Project {
      /**
       * Human-readable project name.
       */
      name: string;

      /**
       * Filesystem root of the CTX project.
       */
      root: string;

      /**
       * Time at which the project was initialized.
       */
      createdAt: DateTime;

      /**
       * Version of the project's CTX metadata.
       */
      version: string;

      /**
       * IANA timezone configured for the project.
       */
      timezone: string;

      /**
       * Date-time formatting template configured by the project.
       *
       * <p>The template follows the formatting rules supported by the report
       * date-time library.
       */
      dateTimeTemplate: string;
    }
  }

  /**
   * Contains the small set of high-level values shown on the overview page.
   *
   * <p>The overview intentionally avoids exposing every available statistic.
   * Detailed measurements remain available under their respective domains.
   */
  export interface Overview {
    metrics: Overview.Metrics;
    currentState: Overview.CurrentState;
    recentActivity: Overview.Activity[];
    timeline: Overview.TimelineEvent[];
  }

  export namespace Overview {
    /**
     * Contains high-level project metrics suitable for summary cards.
     */
    export interface Metrics {
      /**
       * Total number of recorded sessions.
       */
      sessions: number;

      /**
       * Total duration recorded across all sessions.
       */
      recordedDuration: Duration;

      /**
       * Number of distinct local calendar days containing session activity.
       */
      activeDays: number;

      /**
       * Total number of tasks.
       */
      tasks: number;

      /**
       * Number of completed tasks.
       */
      completedTasks: number;

      /**
       * Number of tasks currently in progress.
       */
      inProgressTasks: number;

      /**
       * Number of currently blocked tasks.
       */
      blockedTasks: number;

      /**
       * Number of pending tasks.
       */
      pendingTasks: number;

      /**
       * Total number of recorded logs.
       */
      logs: number;

      /**
       * Total number of recorded decisions.
       */
      decisions: number;

      /**
       * Percentage of tasks that are completed.
       *
       * <p>Returns {@code null} when there are no tasks.
       */
      taskCompletionRate: number | null;

      /**
       * Percentage of tasks that remain open.
       *
       * <p>Returns {@code null} when there are no tasks.
       */
      taskOpenRate: number | null;
    }

    /**
     * Describes the current recorded execution state of the project.
     */
    export interface CurrentState {
      /**
       * Currently active session, if one exists.
       */
      activeSession: Sessions.Record | null;

      /**
       * Currently relevant task associated with the active session, if one
       * can be determined.
       */
      activeTask: Tasks.Record | null;

      /**
       * Number of pending tasks.
       */
      pendingTaskCount: number;

      /**
       * Number of blocked tasks.
       */
      blockedTaskCount: number;

      /**
       * Most recently recorded log.
       */
      latestLog: Logs.Record | null;

      /**
       * Most recently recorded decision.
       */
      latestDecision: Decisions.Record | null;
    }

    /**
     * Represents one event in the compact overview activity feed.
     *
     * <p>Events are derived from persisted sessions, tasks, logs, and
     * decisions. An activity event must correspond to information actually
     * preserved by CTX.
     */
    export interface Activity {
      /**
       * Time at which the activity occurred.
       */
      timestamp: DateTime;

      /**
       * Type identifying the source of the activity.
       */
      type: string;

      /**
       * Identifier of the source record, when available.
       */
      id: string;

      /**
       * Human-readable description suitable for the activity feed.
       */
      description: string;
    }

    /**
     * Represents an event in the project execution timeline.
     *
     * <p>This is intentionally separate from {@link Activity} because the
     * timeline may contain fewer, more significant events than the compact
     * recent-activity feed.
     */
    export interface TimelineEvent {
      /**
       * Time at which the event occurred.
       */
      timestamp: DateTime;

      /**
       * Type identifying the event.
       */
      type: string;

      /**
       * Identifier of the source record, when applicable.
       */
      id: string;

      /**
       * Human-readable title for the timeline event.
       */
      title: string;
    }
  }

  /**
   * Contains all session-related report information.
   */
  export interface Sessions {
    records: Sessions.Record[];
    statistics: Sessions.Statistics;
    durationDistribution: Sessions.Distribution[];
    gaps: Sessions.Gaps;
    evaluations: Sessions.Evaluations;
  }

  export namespace Sessions {
    /**
     * Represents one recorded session.
     */
    export interface Record {
      /**
       * Unique session identifier.
       */
      id: string;

      /**
       * Time at which the session started.
       */
      startTime: DateTime;

      /**
       * Time at which the session ended.
       *
       * <p>{@code null} for an active session.
       */
      endTime: DateTime | null;

      /**
       * Recorded duration of the session.
       */
      duration: Duration;

      /**
       * Optional note attached to the session.
       */
      note: string | null;

      /**
       * Current session status.
       */
      status: string;
    }

    /**
     * Contains aggregate session measurements.
     */
    export interface Statistics {
      count: number;
      completedCount: number;
      activeCount: number;
      totalDuration: Duration;
      averageDuration: Duration;
      medianDuration: Duration;
      longestDuration: Duration;
      shortestDuration: Duration;
    }

    /**
     * Represents one session-duration distribution bucket.
     */
    export interface Distribution {
      /**
       * Human-readable range label.
       */
      label: string;

      /**
       * Number of sessions belonging to the range.
       */
      count: number;
    }

    /**
     * Contains gaps between consecutive sessions.
     */
    export interface Gaps {
      /**
       * Individual gaps between eligible consecutive sessions.
       */
      values: Duration[];

      average: Duration;
      median: Duration;
      longest: Duration;
      shortest: Duration;

      /**
       * Distribution of session gaps.
       */
      distribution: Distribution[];
    }

    /**
     * Contains lightweight session-level evaluations suitable for reporting.
     */
    export interface Evaluations {
      /**
       * Ratio of recorded session time to the project's recorded activity
       * span.
       *
       * <p>{@code null} when the activity span cannot be calculated.
       */
      workContinuityRatio: number | null;

      /**
       * Average number of sessions per active calendar day.
       */
      averageSessionsPerActiveDay: number | null;

      /**
       * Average number of sessions per calendar day in the project span.
       */
      averageSessionsPerCalendarDay: number | null;

      /**
       * Average recorded session time per active day.
       */
      averageRecordedTimePerActiveDay: Duration | null;

      /**
       * Average recorded session time per calendar day.
       */
      averageRecordedTimePerCalendarDay: Duration | null;
    }
  }

  /**
   * Contains all task-related report information.
   */
  export interface Tasks {
    records: Tasks.Record[];
    statistics: Tasks.Statistics;
    statusDistribution: Tasks.StatusDistribution[];
    tree: Tasks.TreeNode[];
    blocked: Tasks.Blocked[];
  }

  export namespace Tasks {
    /**
     * Represents one resolved task.
     */
    export interface Record {
      id: string;
      title: string;
      description: string | null;
      status: string;
      createdAt: DateTime;
      completedAt: DateTime | null;
      completionDuration: Duration | null;
      blockReason: string | null;
      subtaskCount: number;
    }

    /**
     * Contains aggregate task measurements.
     */
    export interface Statistics {
      count: number;
      completedCount: number;
      pendingCount: number;
      inProgressCount: number;
      blockedCount: number;
      openCount: number;
      rootCount: number;
      subtaskCount: number;
      maxDepth: number;

      averageCompletionDuration: Duration;
      medianCompletionDuration: Duration;
      longestCompletionDuration: Duration;
      shortestCompletionDuration: Duration;
    }

    /**
     * Represents the number of tasks in one status.
     */
    export interface StatusDistribution {
      status: string;
      count: number;
    }

    /**
     * Represents one node in the resolved task hierarchy.
     */
    export interface TreeNode {
      task: Record;
      children: TreeNode[];
    }

    /**
     * Represents a task that is currently blocked.
     */
    export interface Blocked {
      taskId: string;
      reason: string;
    }
  }

  /**
   * Contains all log-related report information.
   */
  export interface Logs {
    records: Logs.Record[];
    statistics: Logs.Statistics;
    taskAnalysis: Logs.TaskAnalysis;
  }

  export namespace Logs {
    /**
     * Represents one persisted project log.
     */
    export interface Record {
      id: string;
      timestamp: DateTime;
      note: string;
      type: string;
      reference: Reference | null;
    }

    /**
     * Contains aggregate log measurements.
     */
    export interface Statistics {
      count: number;
      unlinkedCount: number;
      firstTimestamp: DateTime | null;
      latestTimestamp: DateTime | null;
      byType: TypeStatistics;
      issuesCount: number;
      attemptsCount: number;
      logsPerSession: number | null;
      logsPerTask: number | null;
      tasksWithLogs: number;
      tasksWithoutLogs: number;
    }

    /**
     * Contains the number of logs grouped by type.
     */
    export interface TypeStatistics {
      note: number;
      idea: number;
      issue: number;
      attempt: number;
    }

    /**
     * Contains task-oriented relationships derived from logs.
     */
    export interface TaskAnalysis {
      mostLoggedTasks: TaskCount[];
      tasksWithoutLogs: string[];
      issuesByTask: TaskCount[];
      attemptsByTask: TaskCount[];
      repeatedAttempts: RepeatedAttempt[];
    }

    /**
     * Represents a number of logs associated with a task.
     */
    export interface TaskCount {
      taskId: string;
      count: number;
    }

    /**
     * Represents a task with multiple recorded attempts.
     */
    export interface RepeatedAttempt {
      taskId: string;
      count: number;
    }
  }

  /**
   * Contains all decision-related report information.
   */
  export interface Decisions {
    records: Decisions.Record[];
    statistics: Decisions.Statistics;
    references: Decisions.References;
  }

  export namespace Decisions {
    /**
     * Represents one persisted project decision.
     */
    export interface Record {
      id: string;
      topic: string;
      reasoning: string;
      tags: string[];
      timestamp: DateTime;
      reference: Reference | null;
    }

    /**
     * Contains aggregate decision measurements.
     */
    export interface Statistics {
      count: number;
      unlinkedCount: number;
      firstTimestamp: DateTime | null;
      latestTimestamp: DateTime | null;
      byTopic: TopicCount[];
      repeatedTopics: string[];
      uncategorizedCount: number;
      byTag: TagCount[];
    }

    /**
     * Contains decision-reference information.
     */
    export interface References {
      byType: ReferenceCounts;
      tasksWithDecisions: string[];
      sessionsWithDecisions: string[];
    }

    /**
     * Contains the number of decisions associated with each reference type.
     */
    export interface ReferenceCounts {
      task: number;
      session: number;
    }

    /**
     * Represents the number of decisions associated with a topic.
     */
    export interface TopicCount {
      topic: string;
      count: number;
    }

    /**
     * Represents the number of decisions associated with a tag.
     */
    export interface TagCount {
      tag: string;
      count: number;
    }
  }

  /**
   * Represents a reference from one report record to another project entity.
   */
  export interface Reference {
    /**
     * Type of referenced entity, such as {@code task} or {@code session}.
     */
    type: string;

    /**
     * Identifier of the referenced entity.
     */
    id: string;
  }
}
