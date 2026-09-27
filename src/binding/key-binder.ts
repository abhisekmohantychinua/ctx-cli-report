import type { ReportData } from "../data/models/report-data";

/**
 * Binds a report value to a DOM element.
 *
 * @param reportData - Processed report data.
 * @param key - Report data key to bind.
 * @param element - Target DOM element.
 */
export function bindKey(
  reportData: ReportData,
  key: string,
  element: HTMLElement,
): void {
  element.textContent = getValueOfKey(reportData, key);
}

/**
 * Retrieves the value of a report data key.
 *
 * @param reportData - Processed report data.
 * @param key - Report data key to retrieve.
 * @returns The value of the report data key.
 */
function getValueOfKey(reportData: ReportData, key: string): string {
  switch (key) {
    case "metadata.project.name":
      return reportData.metadata.project.name;

    case "metadata.generatedAt":
      return reportData.metadata.generatedAt
        .setZone(reportData.metadata.project.timezone)
        .toFormat(reportData.metadata.project.dateTimeTemplate);

    case "metadata.project.createdAt":
      return reportData.metadata.project.createdAt
        .setZone(reportData.metadata.project.timezone)
        .toFormat(reportData.metadata.project.dateTimeTemplate);

    case "metadata.project.root":
      return reportData.metadata.project.root;

    case "overview.metrics.sessions":
      return reportData.overview.metrics.sessions.toString();

    case "overview.metrics.recordedDuration":
      return reportData.overview.metrics.recordedDuration.toFormat(
        "hh 'hours, 'mm 'minutes'",
      );

    case "overview.metrics.activeDays":
      return reportData.overview.metrics.activeDays.toString();

    case "overview.metrics.tasks":
      return reportData.overview.metrics.tasks.toString();

    case "overview.metrics.taskCompletionRate":
      return reportData.overview.metrics.taskCompletionRate?.toFixed(2) ?? "-";

    case "overview.metrics.completedTasks":
      return reportData.overview.metrics.completedTasks.toString();

    case "overview.metrics.inProgressTasks":
      return reportData.overview.metrics.inProgressTasks.toString();

    case "overview.metrics.blockedTasks":
      return reportData.overview.metrics.blockedTasks.toString();

    case "overview.metrics.pendingTasks":
      return reportData.overview.metrics.pendingTasks.toString();

    case "overview.metrics.logs":
      return reportData.overview.metrics.logs.toString();

    case "overview.metrics.decisions":
      return reportData.overview.metrics.decisions.toString();

    case "overview.currentState.activeSession.id":
      return reportData.overview.currentState.activeSession?.id ?? "";

    case "overview.currentState.activeSession.status":
      return reportData.overview.currentState.activeSession?.status ?? "";

    case "overview.currentState.activeSession.startTime":
      return reportData.overview.currentState.activeSession
        ? reportData.overview.currentState.activeSession.startTime
            .setZone(reportData.metadata.project.timezone)
            .toFormat(reportData.metadata.project.dateTimeTemplate)
        : "";

    case "overview.currentState.activeSession.duration":
      return reportData.overview.currentState.activeSession
        ? reportData.overview.currentState.activeSession.duration.toFormat(
            "hh 'hours, 'mm 'minutes'",
          )
        : "";

    case "overview.currentState.activeSession.note":
      return reportData.overview.currentState.activeSession?.note ?? "";

    case "overview.currentState.activeTask.title":
      return reportData.overview.currentState.activeTask?.title ?? "";

    case "overview.currentState.activeTask.status":
      return reportData.overview.currentState.activeTask?.status ?? "";

    case "overview.currentState.activeTask.id":
      return reportData.overview.currentState.activeTask?.id ?? "";

    case "overview.currentState.activeTask.createdAt":
      return (
        reportData.overview.currentState.activeTask?.createdAt
          .setZone(reportData.metadata.project.timezone)
          .toFormat(reportData.metadata.project.dateTimeTemplate) ?? ""
      );

    default:
      throw new Error("Key not defined: " + key);
  }
}
