import { DateTime } from "luxon";
import type { ReportData } from "../data/models/report-data";

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

    default:
      throw new Error(`Initializer not defined: ${key}`);
  }
}

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

  const colors: Record<string, string> = {
    completed: "#259d72",
    "in-progress": "#4389d9",
    blocked: "#d85a3f",
    pending: "#bdbdbd",
  };

  const normalized = distribution.map((item) => ({
    ...item,
    key: item.status.toLowerCase().replace(/[_\s]+/g, "-"),
    percentage: (item.count / total) * 100,
  }));

  let offset = 0;

  const segments = normalized
    .map((item) => {
      const start = offset;
      offset += item.percentage;

      return `${colors[item.key] ?? "#824d00"} ${start}% ${offset}%`;
    })
    .join(", ");

  const legend = normalized
    .map(
      (item) => `
        <li class="flex items-center justify-between gap-4">
          <span class="flex items-center gap-2">
            <span
              class="size-2 rounded-full"
              style="background-color: ${colors[item.key] ?? "#824d00"}"
            ></span>

            <span class="text-muted text-sm">
              ${formatStatusLabel(item.status)}
            </span>
          </span>

          <span class="text-foreground text-sm font-medium tabular-nums">
            ${item.count}
          </span>
        </li>
      `,
    )
    .join("");

  element.innerHTML = `
    <div class="flex min-h-40 items-center justify-center gap-8">
      <div
        class="relative size-32 shrink-0 rounded-full"
        style="background: conic-gradient(${segments})"
        aria-label="Task status distribution"
      >
        <div
          class="bg-background absolute inset-6 flex items-center justify-center rounded-full"
        >
          <span class="text-foreground text-xl font-semibold tabular-nums">
            ${total}
          </span>
        </div>
      </div>

      <ul class="min-w-32 space-y-3">
        ${legend}
      </ul>
    </div>
  `;
}

function formatStatusLabel(status: string): string {
  return status
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function initializeRecentActivity(
  reportData: ReportData,
  element: HTMLElement,
): void {
  const activities = reportData.overview.recentActivity.slice(0, 5);

  if (activities.length === 0) {
    element.innerHTML = `
      <div class="text-muted p-5 text-sm">
        No recent activity.
      </div>
    `;
    return;
  }

  element.innerHTML = activities
    .map((activity) => {
      const icon = getActivityIcon(activity.type);

      return `
        <div class="flex items-center gap-4 px-5 py-4">
          <span
            class="bg-surface text-primary flex size-9 shrink-0 items-center justify-center rounded-full"
          >
            <iconify-icon
              icon="${icon}"
              class="text-lg"
              aria-hidden="true"
            ></iconify-icon>
          </span>

          <div class="min-w-0 flex-1">
            <p class="text-foreground truncate text-sm font-medium">
              ${escapeHtml(activity.description)}
            </p>

            <p class="text-muted mt-0.5 text-xs">
              ${formatRelativeTime(activity.timestamp, reportData)}
            </p>
          </div>
        </div>
      `;
    })
    .join("");
}

function getActivityIcon(type: string): string {
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

function initializeTimeline(
  reportData: ReportData,
  element: HTMLElement,
): void {
  const events = reportData.overview.timeline.slice(0, 7);

  if (events.length === 0) {
    element.innerHTML = `
      <div class="text-muted py-8 text-center text-sm">
        No timeline events available.
      </div>
    `;
    return;
  }

  element.innerHTML = `
    <div class="flex min-w-max items-start">
      ${events
        .map((event, index) => {
          const isLast = index === events.length - 1;

          return `
            <div class="flex items-start">
              <div class="flex w-44 flex-col items-center text-center">
                <span
                  class="bg-surface text-primary flex size-9 items-center justify-center rounded-full border"
                >
                  <iconify-icon
                    icon="${getTimelineIcon(event.type)}"
                    class="text-lg"
                    aria-hidden="true"
                  ></iconify-icon>
                </span>

                <time
                  class="text-muted mt-3 text-xs tabular-nums"
                >
                  ${formatTimelineDate(event.timestamp, reportData)}
                </time>

                <p class="text-foreground mt-1 text-sm font-medium">
                  ${escapeHtml(event.title)}
                </p>
              </div>

              ${
                isLast
                  ? ""
                  : `
                    <div
                      class="bg-primary/40 mt-4 h-px w-20 shrink-0"
                      aria-hidden="true"
                    ></div>
                  `
              }
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

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

function formatTimelineDate(
  timestamp: DateTime,
  reportData: ReportData,
): string {
  return timestamp
    .setZone(reportData.metadata.project.timezone)
    .toFormat("MMM d, yyyy");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
