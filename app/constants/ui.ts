// Score thresholds for color coding
export const SCORE_THRESHOLDS = {
  EXCELLENT: 30000,
  GOOD: 20000,
  WARNING: 10000,
  DANGER: 0,
} as const;

// Color classes for scores
export const SCORE_COLORS = {
  EXCELLENT: "text-green-600 dark:text-green-400",
  GOOD: "text-gray-900 dark:text-gray-100",
  WARNING: "text-orange-600 dark:text-orange-400",
  DANGER: "text-red-600 dark:text-red-400",
} as const;

// Wind colors
export const WIND_COLORS = {
  東: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  南: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  西: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  北: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
} as const;

// Rank colors
export const RANK_COLORS = {
  1: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  2: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  3: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  4: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
} as const;

// Rank emojis
export const RANK_EMOJIS = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
  4: "💀",
} as const;

// Common card styles
export const CARD_STYLES = {
  BASE: "bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6",
  DEALER: "bg-yellow-50 dark:bg-yellow-900/20 ring-2 ring-yellow-400",
} as const;

// Button styles
export const BUTTON_STYLES = {
  PRIMARY:
    "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors",
  SECONDARY:
    "px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors",
  SUCCESS:
    "px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors",
  DANGER:
    "px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors",
  RIICHI:
    "mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors",
} as const;

// Grid layouts
export const GRID_LAYOUTS = {
  PLAYERS: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
  TWO_COLUMNS: "grid grid-cols-1 lg:grid-cols-2 gap-6",
  SCORE_OPTIONS: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2",
  TENPAI_SELECTION: "grid grid-cols-2 gap-2",
} as const;

// Component dimensions
export const DIMENSIONS = {
  GAME_HISTORY_HEIGHT: "h-[400px]",
  WIND_INDICATOR_SIZE: "w-10 h-10",
  RANK_BADGE_SIZE: "w-8 h-8",
} as const;

// Text sizes
export const TEXT_SIZES = {
  SCORE_MAIN: "text-3xl font-bold",
  SCORE_DIFF: "text-sm",
  BREAKDOWN: "text-xs mt-1 space-y-0.5",
  WIND: "text-lg font-bold",
  RANK: "text-sm font-bold",
} as const;
