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
  });

  describe("getTheme", () => {
    it("returns light when the root does not have the dark class", () => {
      expect(getTheme()).toBe("light");
    });

    it("returns dark when the root has the dark class", () => {
      document.documentElement.classList.add("dark");

      expect(getTheme()).toBe("dark");
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
  });

  describe("initializeTheme", () => {
    it("initializes the document in light mode by default", () => {
      const theme = initializeTheme();

      expect(theme).toBe("light");
      expect(document.documentElement.classList.contains("light")).toBe(true);
    });

    it("preserves an existing dark theme", () => {
      document.documentElement.classList.add("dark");

      const theme = initializeTheme();

      expect(theme).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("removes conflicting theme classes", () => {
      document.documentElement.classList.add("light", "dark");

      initializeTheme();

      expect(document.documentElement.classList.contains("light")).toBe(false);
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  describe("toggleTheme", () => {
    it("changes light mode to dark mode", () => {
      setTheme("light");

      const theme = toggleTheme();

      expect(theme).toBe("dark");
      expect(getTheme()).toBe("dark");
    });

    it("changes dark mode to light mode", () => {
      setTheme("dark");

      const theme = toggleTheme();

      expect(theme).toBe("light");
      expect(getTheme()).toBe("light");
    });
  });

  describe("applyThemeSideEffects", () => {
    it("updates the logo for light mode", () => {
      document.body.innerHTML =
        '<img id="logo" src="old-logo.png" alt="Logo" />';

      applyThemeSideEffects("light", {
        logoSelector: "#logo",
        lightLogoUrl: "logo.png",
        darkLogoUrl: "logo-dark.png",
      });

      expect(document.querySelector("#logo")).toHaveAttribute(
        "src",
        "logo.png",
      );
    });

    it("updates the logo for dark mode", () => {
      document.body.innerHTML =
        '<img id="logo" src="old-logo.png" alt="Logo" />';

      applyThemeSideEffects("dark", {
        logoSelector: "#logo",
        lightLogoUrl: "logo.png",
        darkLogoUrl: "logo-dark.png",
      });

      expect(document.querySelector("#logo")).toHaveAttribute(
        "src",
        "logo-dark.png",
      );
    });

    it("updates the favicon for light mode", () => {
      document.head.innerHTML =
        '<link id="favicon" rel="icon" href="old-favicon.ico" />';

      applyThemeSideEffects("light", {
        faviconSelector: "#favicon",
        lightFaviconUrl: "favicon.ico",
        darkFaviconUrl: "favicon-dark.ico",
      });

      expect(document.querySelector("#favicon")).toHaveAttribute(
        "href",
        "favicon.ico",
      );
    });

    it("updates the favicon for dark mode", () => {
      document.head.innerHTML =
        '<link id="favicon" rel="icon" href="old-favicon.ico" />';

      applyThemeSideEffects("dark", {
        faviconSelector: "#favicon",
        lightFaviconUrl: "favicon.ico",
        darkFaviconUrl: "favicon-dark.ico",
      });

      expect(document.querySelector("#favicon")).toHaveAttribute(
        "href",
        "favicon-dark.ico",
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
