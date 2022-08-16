/**
 * The raw pattern to match URL matchers
 *
 * @see https://developer.chrome.com/docs/extensions/mv3/match_patterns/
 */
// prettier-ignore
export const matcherPattern =
  '^(?:' +
    '(?<fileScheme>file)://' +
    '(?<filePath>/.*|\\*)' +
  '|' +
    '(?:(?<scheme>https?|ftp)://)?' +
    '(?<host>\\*|\\*\\.[^/*]+|[^/]+)' +
    '(?:/(?<path>.*))?' +
  ')$'

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
