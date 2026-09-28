import { DateTime } from "luxon";
import type { ReportData } from "../data/models/report-data";
import ApexCharts from "apexcharts";
import { varToColor } from "preline/plugins/helper-shared";
type Initializer = (data: ReportData, element: HTMLElement) => void;

/**
 * Binds a report initializer to a DOM element.
 *
 * @param reportData - Processed report data.
 * @param key - Initializer key to execute.
 * @param element - Target DOM element.
 */
export function bindInitializer(
  reportData: ReportData,
  key: string,
  element: HTMLElement,
): void {
  const initializer = getInitializer(key);

  initializer(reportData, element);
}

/**
 * Retrieves an initializer by its key.
 *
 * @param key - Initializer key to retrieve.
 * @returns The initializer associated with the key.
 * @throws If the requested initializer is not defined.
 */
function getInitializer(key: string): Initializer {
  switch (key) {
    case "overview.task-status":
      return initializeTaskStatus;

    case "overview.recent-activity":
      return initializeRecentActivity;

    case "overview.timeline":
      return initializeTimeline;

    case "overview.project.root.tooltip":
      return initializeProjectRootTooltip;

    default:
      throw new Error(`Initializer not defined: ${key}`);
  }
}

/**
 * Renders the task-status distribution as a donut chart, or an empty state.
 *
 * @param reportData - Processed report data containing task metrics.
 * @param element - Element in which to render the chart or empty state.
 */
function initializeTaskStatus(
  reportData: ReportData,
  element: HTMLElement,
): void {
  const distribution = reportData.tasks.statusDistribution;
  const total = reportData.overview.metrics.tasks;

  if (distribution.length === 0 || total === 0) {
    element.innerHTML = `
      <div class="text-muted flex min-h-40 items-center justify-center text-sm">
        No task data available.
      </div>
    `;
    return;
  }

  const labels = distribution.map((item) => formatStatusLabel(item.status));

  const series = distribution.map((item) => item.count);

  const chart = new ApexCharts(element, {
    chart: {
      type: "donut",
      height: 180,
    },

    series,

    labels,

    legend: {
      show: true,
      position: "right",
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      width: 0,
    },
    colors: distribution.map((item) => getStatusColor(item.status)),
    plotOptions: {
      pie: {
        spacing: 5,
        borderRadius: 8,
        donut: {
          size: "72%",
          labels: {
            show: true,
            name: {
              show: false,
            },
            value: {
              show: false,
            },
            total: {
              show: true,
              showAlways: true,
              label: "Tasks",
              formatter: () => String(total),
            },
          },
        },
      },
    },
  });

  void chart.render();
}

/** Converts a task status identifier into a readable label. */
function formatStatusLabel(status: string): string {
  return status
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

/** Resolves the theme color associated with a task status. */
function getStatusColor(status: string): string {
  switch (status.toLowerCase().replace(/[_\s]+/g, "-")) {
    case "completed":
      return varToColor("--ctx-success") ?? "#287a4b";

    case "in-progress":
      return varToColor("--ctx-info") ?? "#245f9e";

    case "blocked":
      return varToColor("--ctx-danger") ?? "#b42318";

    case "pending":
      return varToColor("--ctx-muted-color") ?? "#6b6a67";

    default:
      return varToColor("--ctx-primary") ?? "#824d00";
  }
}

/**
 * Renders up to five recent activities, or an empty state when none exist.
 *
 * @param reportData - Processed report data containing recent activity.
 * @param element - Element in which to render the activity list.
 */
function initializeRecentActivity(
  reportData: ReportData,
  element: HTMLElement,
): void {
  const activities = reportData.overview.recentActivity.slice(0, 5);

  if (activities.length === 0) {
    element.innerHTML = `
      <div class="text-muted flex min-h-40 items-center justify-center text-sm">
        No recent activity.
      </div>
    `;
    return;
  }

  element.innerHTML = `
    <div class="divide-border divide-y">
      ${activities
        .map((activity) => {
          const type = activity.type.toLowerCase();

          return `
            <div class="flex items-center gap-4 px-5 py-3.5">
              <!-- Activity icon -->
              <span
                class="bg-surface text-primary flex size-9 shrink-0 items-center justify-center rounded-full"
                aria-hidden="true"
              >
                <iconify-icon
                  icon="${getActivityIcon(type)}"
                  class="text-lg"
                ></iconify-icon>
              </span>

              <!-- Activity content -->
              <div class="min-w-0 flex-1">
                <p class="text-foreground text-sm font-medium">
                  ${getActivityTitle(type)}
                </p>

                <p class="text-muted mt-0.5 truncate text-xs">
                  ${escapeHtml(activity.description)}
                </p>
              </div>

              <!-- Relative time -->
              <time
                class="text-muted shrink-0 text-xs tabular-nums"
                datetime="${activity.timestamp.toISO() ?? ""}"
              >
                ${formatRelativeTime(activity.timestamp, reportData)}
              </time>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

/** Returns the icon identifier associated with an activity type. */
function getActivityIcon(type: string): string {
  switch (type) {
    case "session":
    case "session.started":
      return "mdi:play-circle-outline";

    case "session.ended":
      return "mdi:stop-circle-outline";

    case "task":
    case "task.started":
      return "mdi:play-circle-outline";

    case "task.completed":
      return "mdi:check-circle-outline";

    case "task.blocked":
      return "mdi:alert-circle-outline";

    case "log":
      return "mdi:text-box-outline";

    case "decision":
      return "mdi:lightbulb-outline";

    default:
      return "mdi:circle-outline";
  }
}

/** Returns the display title associated with an activity type. */
function getActivityTitle(type: string): string {
  switch (type) {
    case "session":
      return "Session activity";

    case "session.started":
      return "Session started";

    case "session.ended":
      return "Session ended";

    case "task":
      return "Task activity";

    case "task.started":
      return "Task started";

    case "task.completed":
      return "Task completed";

    case "task.blocked":
      return "Task blocked";

    case "log":
      return "Log added";

    case "decision":
      return "Decision recorded";

    default:
      return "Activity recorded";
  }
}

/**
 * Formats a timestamp as a concise relative time in the project timezone.
 *
 * @param timestamp - Activity timestamp to format.
 * @param reportData - Processed report data providing the project timezone.
 * @returns A relative-time label such as `12m ago`.
 */
function formatRelativeTime(
  timestamp: DateTime,
  reportData: ReportData,
): string {
  const now = DateTime.now().setZone(reportData.metadata.project.timezone);
  const value = timestamp.setZone(reportData.metadata.project.timezone);

  const minutes = Math.floor(now.diff(value, "minutes").minutes);

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days}d ago`;
}

/**
 * Renders the report timeline, or an empty state when no events exist.
 *
 * @param reportData - Processed report data containing timeline events.
 * @param element - Element in which to render the timeline.
 */
function initializeTimeline(
  reportData: ReportData,
  element: HTMLElement,
): void {
  const events = reportData.overview.timeline;

  if (events.length === 0) {
    element.innerHTML = `
      <div class="text-muted flex h-full min-h-40 items-center justify-center text-sm">
        No timeline events available.
      </div>
    `;
    return;
  }

  element.innerHTML = `
    <div class="h-full overflow-x-auto overflow-y-hidden">
      <div class="flex h-full min-w-max items-start px-2">
        ${events
          .map((event, index) => {
            const isLast = index === events.length - 1;

            return `
              <div class="group relative flex h-full items-start">
                <!-- Event -->
                <div class="relative flex h-full w-44 shrink-0 flex-col items-center pt-4">
                  <!-- Connector + marker -->
                  <div class="relative flex w-full items-center">
                    ${
                      index > 0
                        ? `
                          <div
                            class="bg-primary/40 h-px flex-1"
                            aria-hidden="true"
                          ></div>
                        `
                        : `
                          <div class="flex-1"></div>
                        `
                    }

                    <div
                      class="bg-surface border-primary text-primary relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border"
                    >
                      <iconify-icon
                        icon="${getTimelineIcon(event.type)}"
                        class="text-lg"
                        aria-hidden="true"
                      ></iconify-icon>
                    </div>

                    ${
                      !isLast
                        ? `
                          <div
                            class="bg-primary/40 h-px flex-1"
                            aria-hidden="true"
                          ></div>
                        `
                        : `
                          <div class="flex-1"></div>
                        `
                    }
                  </div>

                  <!-- Event content -->
                  <div class="flex flex-1 flex-col items-center px-2 pt-4 text-center">
                    <time
                      class="text-muted text-xs font-medium tabular-nums"
                    >
                      ${formatTimelineDate(event.timestamp, reportData)}
                    </time>

                    <p
                      class="text-foreground mt-2 text-sm font-medium leading-5"
                    >
                      ${escapeHtml(event.title)}
                    </p>
                  </div>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

/** Returns the icon identifier associated with a timeline event type. */
function getTimelineIcon(type: string): string {
  switch (type.toLowerCase()) {
    case "session":
      return "mdi:play-circle-outline";

    case "task":
      return "mdi:checkbox-marked-outline";

    case "log":
      return "mdi:text-box-outline";

    case "decision":
      return "mdi:lightbulb-outline";

    default:
      return "mdi:circle-outline";
  }
}

/**
 * Formats a timeline timestamp as a localized calendar date.
 *
 * @param timestamp - Timeline timestamp to format.
 * @param reportData - Processed report data providing the project timezone.
 * @returns The formatted calendar date.
 */
function formatTimelineDate(
  timestamp: DateTime,
  reportData: ReportData,
): string {
  return timestamp
    .setZone(reportData.metadata.project.timezone)
    .toFormat("MMM d, yyyy");
}

/** Escapes HTML-sensitive characters before inserting text into markup. */
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Sets the project root path as the element's tooltip text.
 *
 * @param reportData - Processed report data containing the project root.
 * @param element - Element whose title attribute will be set.
 */
function initializeProjectRootTooltip(
  reportData: ReportData,
  element: HTMLElement,
): void {
  element.title = reportData.metadata.project.root;
}
