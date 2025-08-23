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
    '(?<simpleScheme>[a-z][a-z0-9+.\\-]*)' +
    
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

    // Credentials & Origin
    '(?<host>' +
      // Literal asterisk
      '\\*' +

      '|(?:' +
        // Username
        '(?:[^@:\\/]+(?::[^@:\\/]+)?@)?' +
        
        // Origin
        '(?:' +
          // Asterisk as subdomain, followed by hostname
          '\\*\\.[^*:\\/]+' +
          '|' +

          // Just a hostname
          '[^:\\/]+' +
          '|' +

          // IPv6 address
          '\\[[0-9a-f:]+\\]'+
        ')' +
      ')' +
      
      // Optional port
      '(?::[0-9]+)?' +
    ')' +

    // Path
    '(?:/(?<path>.*))?' +
  ')$'

export const regexPattern = '^/(?<source>.*)/(?<flags>[dgimsuvy]*)$'

export const inputPattern = `(${matcherPattern}|${regexPattern})`

/**
 * Check whether the given matcher input should be interpreted as a regex pattern
 */
export function isRegexPattern(input: string): boolean {
  return input.startsWith('/')
}

const regexPatternRegex = new RegExp(regexPattern)

/**
 * Create a regex from a regex pattern
 */
export function createRegexFromRegexPattern(input: string): RegExp {
  const result = input.match(regexPatternRegex)
  if (!result) {
    throw new Error('Invalid regex pattern: ' + input)
  }

  return new RegExp(result.groups!.source, result.groups!.flags)
}

/**
 * Check whether the given input is a valid regex pattern
 */
export function isValidRegexPattern(input: string): boolean {
  if (!isRegexPattern(input)) return false

  try {
    createRegexFromRegexPattern(input)
    return true
  } catch {
    return false
  }
}

/**
 * Capitalize a string
 */
export function capitalize(string: string): string {
  return string.slice(0, 1).toUpperCase() + string.slice(1)
}

/**
 * Escape special characters in a regex string
 */
export function sanitizeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const isExtensionWorker =
  typeof globalThis?.chrome?.runtime !== 'undefined'
