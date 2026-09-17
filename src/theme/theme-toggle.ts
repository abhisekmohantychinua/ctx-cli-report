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
 * Local storage key used to persist the selected application theme.
 *
 * The value is shared across page navigations and browser refreshes.
 */
const THEME_STORAGE_KEY = "ctx-cli-theme";

/**
 * Root element used for class-based theme switching.
 */
const THEME_ROOT = document.documentElement;

const THEME_TOGGLE_SELECTOR = "[data-theme-toggle]";
const THEME_TOGGLE_INDICATOR_SELECTOR = "[data-theme-toggle-indicator]";

/**
 * Returns the currently configured application theme.
 *
 * The persisted theme is read from local storage. If local storage does not
 * contain a supported theme, the current document theme is used as a
 * fallback.
 *
 * Any value other than `dark` or `light` is treated as invalid.
 *
 * @returns The configured application theme.
 */
export function getTheme(): Theme {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return THEME_ROOT.classList.contains("dark") ? "dark" : DEFAULT_THEME;
}

/**
 * Applies and persists a theme.
 *
 * The root always has exactly one supported theme class:
 * `light` or `dark`.
 * The selected theme is also saved to local storage so it remains active
 * across page navigation and browser refreshes.
 *
 * @param theme Theme to apply and persist.
 */
export function setTheme(theme: Theme): void {
  THEME_ROOT.classList.remove("light", "dark");
  THEME_ROOT.classList.add(theme);

  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
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
 * The initialization process reads the persisted theme, applies it to the
 * document root, updates theme-dependent DOM elements, and synchronizes
 * all theme toggle controls.
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
 * The newly selected theme is applied to the document root, persisted to
 * local storage, and propagated to all configured theme-dependent elements.
 *
 * @param options Optional selectors and asset URLs.
 * @returns The newly active and persisted theme.
 */
export function toggleTheme(options: ThemeSideEffectOptions = {}): Theme {
  const nextTheme: Theme = getTheme() === "light" ? "dark" : "light";

  setTheme(nextTheme);
  applyThemeSideEffects(nextTheme, options);

  return nextTheme;
}
