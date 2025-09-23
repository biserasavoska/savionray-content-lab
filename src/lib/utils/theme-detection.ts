/**
 * Theme detection utilities for handling special browser/OS environments
 * that can cause white text on white background issues
 */

export interface ThemeEnvironment {
  forcedColors: boolean;
  colorScheme: 'light' | 'dark';
  highContrast: boolean;
}

/**
 * Detect the current theme environment
 * This helps identify when browsers/OS are applying color interventions
 */
export function detectThemeEnvironment(): ThemeEnvironment {
  const forcedColors = window.matchMedia('(forced-colors: active)').matches;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const highContrast = window.matchMedia('(prefers-contrast: high)').matches;

  return {
    forcedColors,
    colorScheme: prefersDark ? 'dark' : 'light',
    highContrast,
  };
}

/**
 * Set data attributes on document element for CSS targeting
 * This allows CSS to respond to special environments
 */
export function setThemeDataAttributes(): void {
  const env = detectThemeEnvironment();
  const html = document.documentElement;

  // Set data attributes for CSS targeting
  html.dataset.forcedColors = env.forcedColors ? 'on' : 'off';
  html.dataset.colorScheme = env.colorScheme;
  html.dataset.highContrast = env.highContrast ? 'on' : 'off';

  // Add classes for easier CSS targeting
  if (env.forcedColors) {
    html.classList.add('forced-colors');
  }
  if (env.highContrast) {
    html.classList.add('high-contrast');
  }
}

/**
 * Initialize theme detection
 * Call this early in the app lifecycle
 */
export function initializeThemeDetection(): () => void {
  // Set initial state
  setThemeDataAttributes();

  // Listen for changes
  const forcedColorsQuery = window.matchMedia('(forced-colors: active)');
  const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const contrastQuery = window.matchMedia('(prefers-contrast: high)');

  const updateTheme = () => {
    setThemeDataAttributes();
  };

  // Add event listeners
  forcedColorsQuery.addEventListener('change', updateTheme);
  colorSchemeQuery.addEventListener('change', updateTheme);
  contrastQuery.addEventListener('change', updateTheme);

  // Return cleanup function
  return () => {
    forcedColorsQuery.removeEventListener('change', updateTheme);
    colorSchemeQuery.removeEventListener('change', updateTheme);
    contrastQuery.removeEventListener('change', updateTheme);
  };
}

/**
 * Check if we're in a problematic environment
 * Returns true if we're in a scenario that commonly causes white-on-white text
 */
export function isProblematicEnvironment(): boolean {
  const env = detectThemeEnvironment();
  
  // Common problematic scenarios:
  // 1. Forced colors active (Windows High Contrast)
  // 2. High contrast mode
  // 3. Dark mode with incomplete theme support
  return env.forcedColors || env.highContrast;
}

/**
 * Get recommended CSS classes for a component
 * Returns Tailwind classes that ensure proper contrast
 */
export function getDefensiveClasses(): string {
  const env = detectThemeEnvironment();
  
  if (env.forcedColors) {
    // Use explicit colors that work in forced-colors mode
    return 'bg-white text-black border-black';
  }
  
  if (env.highContrast) {
    // Use high contrast colors
    return 'bg-white text-black border-black';
  }
  
  // Default defensive classes
  return 'bg-surface text-fg border-border';
}
