import { DEFAULT_THEME_SIDE_EFFECT_OPTIONS } from "./constants";
import type { ThemeSideEffectOptions } from "./theme";
import { initializeTheme } from "./theme-toggle";

/**
 * Initializes the report's theme system.
 *
 * The persisted theme is restored from local storage when available.
 * Otherwise, the current document theme is used as the fallback.
 *
 * Theme-specific asset handling will be added when the report markup is
 * implemented.
 */
export function bootstrapTheming(
  options: Partial<ThemeSideEffectOptions> = {},
): void {
  initializeTheme({
    ...DEFAULT_THEME_SIDE_EFFECT_OPTIONS,
    ...options,
  });
}
