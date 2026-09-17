import { beforeEach, describe, expect, it } from "vitest";
import {
  applyThemeSideEffects,
  getTheme,
  initializeTheme,
  setTheme,
  toggleTheme,
} from "../../src/theme/theme-toggle";

describe("theme-toggle", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    document.body.innerHTML = "";
    window.localStorage.clear();
  });

  describe("getTheme", () => {
    it("returns light when no theme has been persisted", () => {
      expect(getTheme()).toBe("light");
    });

    it("returns the persisted light theme", () => {
      window.localStorage.setItem("ctx-cli-theme", "light");

      document.documentElement.classList.add("dark");

      expect(getTheme()).toBe("light");
    });

    it("returns the persisted dark theme", () => {
      window.localStorage.setItem("ctx-cli-theme", "dark");

      expect(getTheme()).toBe("dark");
    });

    it("falls back to the document theme when the persisted value is invalid", () => {
      window.localStorage.setItem("ctx-cli-theme", "system");
      document.documentElement.classList.add("dark");

      expect(getTheme()).toBe("dark");
    });

    it("falls back to light when the persisted value is invalid and the root is not dark", () => {
      window.localStorage.setItem("ctx-cli-theme", "system");

      expect(getTheme()).toBe("light");
    });
  });

  describe("setTheme", () => {
    it("sets the light class", () => {
      setTheme("light");

      expect(document.documentElement.className).toBe("light");
    });

    it("sets the dark class", () => {
      setTheme("dark");

      expect(document.documentElement.className).toBe("dark");
    });

    it("removes the previous theme class", () => {
      document.documentElement.classList.add("dark");

      setTheme("light");

      expect(document.documentElement.classList.contains("dark")).toBe(false);
      expect(document.documentElement.classList.contains("light")).toBe(true);
    });

    it("persists the selected light theme", () => {
      setTheme("light");

      expect(window.localStorage.getItem("ctx-cli-theme")).toBe("light");
    });

    it("persists the selected dark theme", () => {
      setTheme("dark");

      expect(window.localStorage.getItem("ctx-cli-theme")).toBe("dark");
    });

    it("updates the persisted theme when changing themes", () => {
      setTheme("dark");
      setTheme("light");

      expect(window.localStorage.getItem("ctx-cli-theme")).toBe("light");
    });
  });

  describe("initializeTheme", () => {
    it("initializes the document in light mode by default", () => {
      const theme = initializeTheme();

      expect(theme).toBe("light");
      expect(document.documentElement.classList.contains("light")).toBe(true);
      expect(window.localStorage.getItem("ctx-cli-theme")).toBe("light");
    });

    it("initializes the document using the persisted dark theme", () => {
      window.localStorage.setItem("ctx-cli-theme", "dark");

      const theme = initializeTheme();

      expect(theme).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(document.documentElement.classList.contains("light")).toBe(false);
    });

    it("initializes the document using the persisted light theme", () => {
      window.localStorage.setItem("ctx-cli-theme", "light");

      document.documentElement.classList.add("dark");

      const theme = initializeTheme();

      expect(theme).toBe("light");
      expect(document.documentElement.classList.contains("light")).toBe(true);
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("removes conflicting theme classes", () => {
      window.localStorage.setItem("ctx-cli-theme", "dark");
      document.documentElement.classList.add("light", "dark");

      initializeTheme();

      expect(document.documentElement.classList.contains("light")).toBe(false);
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("restores the persisted theme after the document classes are cleared", () => {
      setTheme("dark");

      document.documentElement.className = "";

      const theme = initializeTheme();

      expect(theme).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  describe("toggleTheme", () => {
    it("changes light mode to dark mode", () => {
      setTheme("light");

      const theme = toggleTheme();

      expect(theme).toBe("dark");
      expect(getTheme()).toBe("dark");
      expect(window.localStorage.getItem("ctx-cli-theme")).toBe("dark");
    });

    it("changes dark mode to light mode", () => {
      setTheme("dark");

      const theme = toggleTheme();

      expect(theme).toBe("light");
      expect(getTheme()).toBe("light");
      expect(window.localStorage.getItem("ctx-cli-theme")).toBe("light");
    });
  });

  describe("applyThemeSideEffects", () => {
    it("updates the logo for light mode", () => {
      document.body.innerHTML =
        '<img id="logo" src="/logo-dark.svg" alt="Logo" />';

      applyThemeSideEffects("light", {
        logoSelector: "#logo",
        lightLogoUrl: "/logo-light.svg",
        darkLogoUrl: "/logo-dark.svg",
      });

      expect(document.querySelector("#logo")).toHaveAttribute(
        "src",
        "/logo-light.svg",
      );
    });

    it("updates the logo for dark mode", () => {
      document.body.innerHTML =
        '<img id="logo" src="/logo-light.svg" alt="Logo" />';

      applyThemeSideEffects("dark", {
        logoSelector: "#logo",
        lightLogoUrl: "/logo-light.svg",
        darkLogoUrl: "/logo-dark.svg",
      });

      expect(document.querySelector("#logo")).toHaveAttribute(
        "src",
        "/logo-dark.svg",
      );
    });

    it("updates the favicon for light mode", () => {
      document.head.innerHTML =
        '<link id="favicon" rel="icon" href="/favicon-dark.svg" />';

      applyThemeSideEffects("light", {
        faviconSelector: "#favicon",
        lightFaviconUrl: "/favicon-light.svg",
        darkFaviconUrl: "/favicon-dark.svg",
      });

      expect(document.querySelector("#favicon")).toHaveAttribute(
        "href",
        "/favicon-light.svg",
      );
    });

    it("updates the favicon for dark mode", () => {
      document.head.innerHTML =
        '<link id="favicon" rel="icon" href="/favicon-light.svg" />';

      applyThemeSideEffects("dark", {
        faviconSelector: "#favicon",
        lightFaviconUrl: "/favicon-light.svg",
        darkFaviconUrl: "/favicon-dark.svg",
      });

      expect(document.querySelector("#favicon")).toHaveAttribute(
        "href",
        "/favicon-dark.svg",
      );
    });

    it("does not fail when target elements are missing", () => {
      expect(() =>
        applyThemeSideEffects("dark", {
          logoSelector: "#missing-logo",
          faviconSelector: "#missing-favicon",
          darkLogoUrl: "logo-dark.png",
          darkFaviconUrl: "favicon-dark.ico",
        }),
      ).not.toThrow();
    });

    it("does not overwrite assets when the corresponding URL is missing", () => {
      document.body.innerHTML =
        '<img id="logo" src="existing-logo.png" alt="Logo" />';

      applyThemeSideEffects("dark", {
        logoSelector: "#logo",
        lightLogoUrl: "logo.png",
      });

      expect(document.querySelector("#logo")).toHaveAttribute(
        "src",
        "existing-logo.png",
      );
    });
  });
});
