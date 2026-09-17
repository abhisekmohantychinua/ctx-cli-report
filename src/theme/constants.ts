import type { Theme, ThemeSideEffectOptions } from "./theme";

/**
 * Default theme used when no valid theme has been configured.
 */
export const DEFAULT_THEME: Theme = "light";

/**
 * Local storage key used to persist the selected application theme.
 *
 * The value is shared across page navigations and browser refreshes.
 */
export const THEME_STORAGE_KEY = "ctx-cli-theme";

/**
 * Root element used for class-based theme switching.
 */
export const THEME_ROOT = document.documentElement;

export const THEME_TOGGLE_SELECTOR = "[data-theme-toggle]";
export const THEME_TOGGLE_INDICATOR_SELECTOR = "[data-theme-toggle-indicator]";

export const DEFAULT_THEME_SIDE_EFFECT_OPTIONS: ThemeSideEffectOptions = {
  logoSelector: "[data-theme-logo]",
  lightLogoUrl: "/logo.png",
  darkLogoUrl: "/logo-dark.png",

  faviconSelector: "[data-theme-favicon]",
  lightFaviconUrl: "/favicon.ico",
  darkFaviconUrl: "/favicon-dark.ico",
};
