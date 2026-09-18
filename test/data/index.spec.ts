import { beforeEach, describe, expect, it, vi } from "vitest";

import { bootstrapData } from "../../src/data";
import type { RawReportData } from "../../src/data/models/raw";
import type { ReportData } from "../../src/data/models/report";
import * as loader from "../../src/data/loader";
import * as processor from "../../src/data/processor";

describe("bootstrapData", () => {
  const rawData = {} as RawReportData;
  const reportData = {} as ReportData;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads the raw context and processes it into report data", async () => {
    const loadContext = vi
      .spyOn(loader, "loadContext")
      .mockResolvedValue(rawData);

    const processReport = vi
      .spyOn(processor, "processReport")
      .mockReturnValue(reportData);

    const result = await bootstrapData();

    expect(loadContext).toHaveBeenCalledOnce();
    expect(processReport).toHaveBeenCalledOnce();
    expect(processReport).toHaveBeenCalledWith(rawData);
    expect(result).toBe(reportData);
  });

  it("propagates an error when loading the context fails", async () => {
    const error = new Error("Failed to load context");

    vi.spyOn(loader, "loadContext").mockRejectedValue(error);

    await expect(bootstrapData()).rejects.toBe(error);

    expect(processor.processReport).not.toHaveBeenCalled();
  });

  it("propagates an error when report processing fails", async () => {
    const error = new Error("Failed to process report");

    vi.spyOn(loader, "loadContext").mockResolvedValue(rawData);
    vi.spyOn(processor, "processReport").mockImplementation(() => {
      throw error;
    });

    await expect(bootstrapData()).rejects.toBe(error);
  });
});
