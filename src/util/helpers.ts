/**
 * The raw pattern to match URL matchers
 *
 * @see https://developer.chrome.com/docs/extensions/mv3/match_patterns/
 */
export const matcherPattern =
  '((?<scheme>\\*|https?|file|ftp)://)?(?<host>\\*|\\*\\.[^/*]+|[^/*]+\\.[^/*]+|localhost(:[0-9]+)?)(/(?<path>.*))?'

/**
 * Capitalize a string
 */
export const capitalize = (string: string) =>
  string.slice(0, 1).toUpperCase() + string.slice(1)

/**
 * Escape special characters in a regex string
 */
export function sanitizeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
