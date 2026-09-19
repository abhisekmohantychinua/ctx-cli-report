import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  bootstrapData: vi.fn(),
  bootstrapBinding: vi.fn(),
  bootstrapTheming: vi.fn(),
  autoInit: vi.fn(),
}));

vi.mock("../src/data", () => ({
  bootstrapData: mocks.bootstrapData,
}));

vi.mock("../src/binding", () => ({
  bootstrapBinding: mocks.bootstrapBinding,
}));

vi.mock("../src/theme", () => ({
  bootstrapTheming: mocks.bootstrapTheming,
}));

vi.mock("preline/non-auto", () => ({
  HSStaticMethods: {
    autoInit: mocks.autoInit,
  },
}));

describe("main", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    document.body.innerHTML = "";

    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("bootstraps the application after data and DOM are ready", async () => {
    const report = {
      metadata: {
        id: "project-1",
      },
    };

    mocks.bootstrapData.mockResolvedValue(report);

    await import("../src/main");

    await vi.waitFor(() => {
      expect(mocks.bootstrapTheming).toHaveBeenCalledOnce();
    });

    expect(mocks.bootstrapData).toHaveBeenCalledOnce();
    expect(mocks.bootstrapBinding).toHaveBeenCalledOnce();
    expect(mocks.bootstrapBinding).toHaveBeenCalledWith(report);
    expect(mocks.autoInit).toHaveBeenCalledOnce();
  });

  it("waits for DOMContentLoaded before initializing the application", async () => {
    const report = {
      metadata: {
        id: "project-1",
      },
    };

    mocks.bootstrapData.mockResolvedValue(report);

    const originalReadyState = document.readyState;

    Object.defineProperty(document, "readyState", {
      configurable: true,
      get: () => "loading",
    });

    try {
      await import("../src/main");

      await Promise.resolve();

      expect(mocks.bootstrapTheming).not.toHaveBeenCalled();
      expect(mocks.autoInit).not.toHaveBeenCalled();

      document.dispatchEvent(new Event("DOMContentLoaded"));

      await vi.waitFor(() => {
        expect(mocks.bootstrapTheming).toHaveBeenCalledOnce();
      });

      expect(mocks.bootstrapBinding).toHaveBeenCalledOnce();
      expect(mocks.bootstrapBinding).toHaveBeenCalledWith(report);
      expect(mocks.autoInit).toHaveBeenCalledOnce();
    } finally {
      Object.defineProperty(document, "readyState", {
        configurable: true,
        value: originalReadyState,
      });
    }
  });

  it("does not initialize the application when data loading fails", async () => {
    const error = new Error("Failed to load context");

    mocks.bootstrapData.mockRejectedValue(error);

    await import("../src/main");

    await vi.waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Failed to initialize application.",
        error,
      );
    });

    expect(mocks.bootstrapTheming).not.toHaveBeenCalled();
    expect(mocks.bootstrapBinding).not.toHaveBeenCalled();
    expect(mocks.autoInit).not.toHaveBeenCalled();
  });

  it("initializes theming, binding, and Preline in order", async () => {
    const report = {
      metadata: {
        id: "project-1",
      },
    };

    const initializationOrder: string[] = [];

    mocks.bootstrapData.mockResolvedValue(report);
    mocks.bootstrapTheming.mockImplementation(() => {
      initializationOrder.push("theme");
    });
    mocks.bootstrapBinding.mockImplementation(() => {
      initializationOrder.push("binding");
    });
    mocks.autoInit.mockImplementation(() => {
      initializationOrder.push("preline");
    });

    await import("../src/main");

    await vi.waitFor(() => {
      expect(initializationOrder).toEqual(["theme", "binding", "preline"]);
    });
  });
});
