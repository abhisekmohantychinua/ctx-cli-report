import { initializeTheme } from "./theme-toggle";

/**
 * Initializes the report's default theme.
 *
 * The theme starts in light mode unless the document root already contains
 * the `dark` class. Theme-specific asset handling will be added when the
 * report markup is implemented.
 */
export function bootstrapTheming(): void {
  initializeTheme();
}

bootstrapTheming();
