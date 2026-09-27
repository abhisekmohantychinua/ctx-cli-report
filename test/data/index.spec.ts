import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SourceData } from "../../src/data/models/source-data";
import { bootstrapData } from "../../src/data";
import * as loader from "../../src/data/loader";
import * as processor from "../../src/data/processor";

describe("bootstrapData", () => {
  const rawData = {} as SourceData;
  const data = {} as ReturnType<typeof processor.processSourceData>;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads the raw context and processes it into data", async () => {
    const loadContext = vi
      .spyOn(loader, "loadContext")
      .mockResolvedValue(rawData);

    const processReportData = vi
      .spyOn(processor, "processSourceData")
      .mockReturnValue(data);

    const result = await bootstrapData();

    expect(loadContext).toHaveBeenCalledOnce();
    expect(processReportData).toHaveBeenCalledOnce();
    expect(processReportData).toHaveBeenCalledWith(rawData);
    expect(result).toBe(data);
  });

  it("propagates an error when loading the context fails", async () => {
    const error = new Error("Failed to load context");

    const loadContext = vi
      .spyOn(loader, "loadContext")
      .mockRejectedValue(error);

    const processReportData = vi.spyOn(processor, "processSourceData");

    await expect(bootstrapData()).rejects.toBe(error);

    expect(loadContext).toHaveBeenCalledOnce();
    expect(processReportData).not.toHaveBeenCalled();
  });

  it("propagates an error when report processing fails", async () => {
    const error = new Error("Failed to process report data");

    vi.spyOn(loader, "loadContext").mockResolvedValue(rawData);

    const processReportData = vi
      .spyOn(processor, "processSourceData")
      .mockImplementation(() => {
        throw error;
      });

    await expect(bootstrapData()).rejects.toBe(error);

    expect(processReportData).toHaveBeenCalledOnce();
    expect(processReportData).toHaveBeenCalledWith(rawData);
  });
});
