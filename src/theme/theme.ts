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
