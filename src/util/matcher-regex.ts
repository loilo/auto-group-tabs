import { matcherPattern, sanitizeRegex } from '@/util/helpers'

/**
 * Generate a regular expression from a matcher string
 */
export function generateMatcherRegex(matcher: string, isRegexMode = false) {
  if (isRegexMode) {
    try {
      return new RegExp(matcher)
    } catch (e) {
      console.error(`Invalid regex pattern: ${matcher}`, e)
      // Return a regex that never matches if the provided regex is invalid
      return new RegExp('$.' + Math.random()) // Ensure it doesn't match anything by using a random suffix
    }
  }

  /**
   * Replace asterisks in a regex string
   */
  function generatePatternString(string: string, asteriskReplacement: string) {
    return string.split('*').map(sanitizeRegex).join(asteriskReplacement)
  }

  const matcherPatternRegex = new RegExp(matcherPattern)

  const result = matcher.match(matcherPatternRegex)

  if (!result) {
    throw new Error('Invalid matcher: ' + matcher)
  }

  // Shortcut for catch-all matchers
  if (matcher === '*') return /^.*$/

  const { scheme, host, path, simpleScheme, simplePath } = result.groups ?? {}

  const schemePattern = simpleScheme
    ? simpleScheme
    : typeof scheme === 'string'
    ? generatePatternString(scheme, 'https?')
    : 'https?'

  let hostPattern: string
  if (simpleScheme) {
    hostPattern = ''
  } else if (typeof host === 'string') {
    // Three possible formats: *, *.host, host
    if (host === '*') {
      hostPattern = '[^/]+'
    } else if (host.startsWith('*.')) {
      // Format: *.host
      hostPattern = generatePatternString(`*${host.slice(2)}`, '(?:[^/]+\\.)?')
    } else {
      // Format: host
      hostPattern = sanitizeRegex(host)
    }

    // Add port wildcard
    if (!/:[0-9]+$/.test(host)) {
      hostPattern += '(?::[0-9]+)?'
    }
  } else {
    // A theoretically impossible case, but used as a fallback
    // if for some reason input validation did not catch it
    hostPattern = '[^/]+'
  }

  let pathPattern: string
  if (simplePath) {
    pathPattern = generatePatternString(simplePath, '.*')
  } else if (typeof path === 'string') {
    pathPattern = `(?:/${generatePatternString(path, '.*')})?`
  } else {
    pathPattern = '(?:/.*)?'
  }

  return new RegExp(`^${schemePattern}://${hostPattern}${pathPattern}$`)
}
