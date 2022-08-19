/**
 * The raw pattern to match URL matchers
 *
 * @see https://developer.chrome.com/docs/extensions/mv3/match_patterns/
 */
// prettier-ignore
export const matcherPattern =
  '^(?:' +
  // First option: simple cases where just a valid scheme is enforced
    // URI Scheme
    '(?<simpleScheme>[a-z][a-z0-9+.-]*)' +
    
    // Exclude schemes that are reserved for complex cases
    '(?<!https?|ftp|\\*)' +

    // Scheme suffix
    // We explicitly do _not_ support schemes without an authority component because
    // of the ambigouity of things like "data:1234" which could be interpreted as
    // a scheme + path as well as a hostname + port.
    '://' +

    // Path
    '(?<simplePath>.*)' +
  '|' +
  // Second option: complex validation of asterisks in scheme, hostname, ...
    // Possible schemes are http, https, ftp, and a literal asterisk *
    '(?:(?<scheme>https?|ftp|\\*)://)?' +

    // Hostname
    '(?<host>' +
      // Literal asterisk
      '\\*' +

      // Hostname pattern with optional port
      '|(?:(?:[^@:/]+(?::[^@:/]+)?@)?(?:' +
        // Asterisk as subdomain, followed by hostname
        '\\*\\.[^/*:]+' +
        '|' +

        // Hostname
        '[^/:]+' +
        '|' +

        // IPv6 address
        '\\[[0-9a-f:]+\\]'+
      '))(?::[0-9]+)?' +
    ')' +

    // Path
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
