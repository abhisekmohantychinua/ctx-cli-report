/**
 * Supported application themes.
 */
export type Theme = "light" | "dark";

/**
 * Configuration for theme-related DOM side effects.
 *
 * Selectors are optional so the theming module can be used before the
 * corresponding HTML elements are introduced.
 */
export interface ThemeSideEffectOptions {
  /**
   * Selector for elements whose `src` should point to the light/dark logo.
   *
   * The selected element receives the appropriate asset URL.
   */
  logoSelector?: string;

  /**
   * URL of the light-theme logo.
   */
  lightLogoUrl?: string;

  /**
   * URL of the dark-theme logo.
   */
  darkLogoUrl?: string;

  /**
   * Selector for the favicon `<link>` element.
   */
  faviconSelector?: string;

  /**
   * URL of the light-theme favicon.
   */
  lightFaviconUrl?: string;

  /**
   * URL of the dark-theme favicon.
   */
  darkFaviconUrl?: string;
}

/**
 * Default theme used when no valid theme has been configured.
 */
const DEFAULT_THEME: Theme = "light";

/**
 * Root element used for class-based theme switching.
 */
const THEME_ROOT = document.documentElement;

const THEME_TOGGLE_SELECTOR = "[data-theme-toggle]";
const THEME_TOGGLE_INDICATOR_SELECTOR = "[data-theme-toggle-indicator]";

/**
 * Returns the currently active theme.
 *
 * Any state other than the supported `dark` class is treated as light.
 */
export function getTheme(): Theme {
  return THEME_ROOT.classList.contains("dark") ? "dark" : "light";
}

/**
 * Applies a theme to the document root.
 *
 * The root always has exactly one supported theme class:
 * `light` or `dark`.
 *
 * @param theme Theme to apply.
 */
export function setTheme(theme: Theme): void {
  THEME_ROOT.classList.remove("light", "dark");
  THEME_ROOT.classList.add(theme);
}

/**
 * Updates theme-dependent DOM elements.
 *
 * Missing elements or missing asset URLs are ignored deliberately. This
 * allows the theming module to be initialized before the report markup
 * contains logos or favicons.
 *
 * @param theme Active theme.
 * @param options Optional selectors and asset URLs.
 */
export function applyThemeSideEffects(
  theme: Theme,
  options: ThemeSideEffectOptions = {},
): void {
  const {
    logoSelector,
    lightLogoUrl,
    darkLogoUrl,
    faviconSelector,
    lightFaviconUrl,
    darkFaviconUrl,
  } = options;

  if (logoSelector) {
    const logo = document.querySelector<HTMLImageElement>(logoSelector);
    const logoUrl = theme === "dark" ? darkLogoUrl : lightLogoUrl;

    if (logo && logoUrl) {
      logo.src = logoUrl;
    }
  }

  if (faviconSelector) {
    const favicon = document.querySelector<HTMLLinkElement>(faviconSelector);
    const faviconUrl = theme === "dark" ? darkFaviconUrl : lightFaviconUrl;

    if (favicon && faviconUrl) {
      favicon.href = faviconUrl;
    }
  }
}

/**
 * Initializes the theme system and connects theme toggle controls.
 *
 * @param options Optional selectors and asset URLs.
 * @returns The active theme after initialization.
 */
export function initializeTheme(options: ThemeSideEffectOptions = {}): Theme {
  const currentTheme = getTheme() || DEFAULT_THEME;

  setTheme(currentTheme);
  applyThemeSideEffects(currentTheme, options);
  updateThemeToggleControls(currentTheme);

  document
    .querySelectorAll<HTMLButtonElement>(THEME_TOGGLE_SELECTOR)
    .forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const nextTheme = toggleTheme(options);

        updateThemeToggleControls(nextTheme);
      });
    });

  return currentTheme;
}

/**
 * Updates the appearance and accessibility state of all theme toggles.
 */
function updateThemeToggleControls(theme: Theme): void {
  const isDark = theme === "dark";

  document
    .querySelectorAll<HTMLButtonElement>(THEME_TOGGLE_SELECTOR)
    .forEach((toggle) => {
      const indicator = toggle.querySelector<HTMLElement>(
        THEME_TOGGLE_INDICATOR_SELECTOR,
      );

      toggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme",
      );

      toggle.setAttribute(
        "title",
        isDark ? "Switch to light theme" : "Switch to dark theme",
      );

      if (!indicator) {
        return;
      }

      indicator.classList.toggle("translate-x-9.5", isDark);
      indicator.classList.toggle("translate-x-0", !isDark);

      indicator.innerHTML = isDark
        ? `
          <iconify-icon
            icon="mdi:weather-night"
            class="text-base"
            aria-hidden="true"
          ></iconify-icon>
        `
        : `
          <iconify-icon
            icon="mdi:white-balance-sunny"
            class="text-base"
            aria-hidden="true"
          ></iconify-icon>
        `;
    });
}

/**
 * Toggles between light and dark themes.
 *
 * The new theme is applied to the document root and all configured
 * theme-dependent side effects are updated.
 *
 * @param options Optional selectors and asset URLs.
 * @returns The newly active theme.
 */
export function toggleTheme(options: ThemeSideEffectOptions = {}): Theme {
  const nextTheme: Theme = getTheme() === "light" ? "dark" : "light";

  setTheme(nextTheme);
  applyThemeSideEffects(nextTheme, options);

  return nextTheme;
}
