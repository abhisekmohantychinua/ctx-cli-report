import { beforeEach, describe, expect, it, vi } from "vitest";

describe("theme/index", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doUnmock("../../src/theme/theme-toggle");

    document.documentElement.className = "";
    document.body.innerHTML = "";
    window.localStorage.clear();
  });

  it("bootstraps the theme system using initializeTheme", async () => {
    const initializeTheme = vi.fn();

    vi.doMock("../../src/theme/theme-toggle", () => ({
      initializeTheme,
    }));

    const { bootstrapTheming } = await import("../../src/theme");

    bootstrapTheming();

    expect(initializeTheme).toHaveBeenCalledOnce();
    expect(initializeTheme).toHaveBeenCalledWith();
  });

  it("restores the persisted theme when bootstrapping", async () => {
    window.localStorage.setItem("ctx-cli-theme", "dark");

    const { bootstrapTheming } = await import("../../src/theme");

    bootstrapTheming();

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("uses light theme when no theme has been persisted", async () => {
    const { bootstrapTheming } = await import("../../src/theme");

    bootstrapTheming();

    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
