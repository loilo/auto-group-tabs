import {
  createRegexFromRegexPattern,
  isRegexPattern,
  isValidRegexPattern,
  matcherPattern,
  sanitizeRegex
} from '@/util/helpers'

/**
 * Replace asterisks in a regex string
 */
function generatePatternString(string: string, asteriskReplacement: string) {
  return string.split('*').map(sanitizeRegex).join(asteriskReplacement)
}

/**
 * Generate a regular expression from a matcher string
 */
export function generateMatcherRegex(matcher: string): RegExp {
  // Handle regex patterns
  if (isRegexPattern(matcher)) {
    if (!isValidRegexPattern(matcher)) {
      throw new Error('Invalid regex pattern: ' + matcher)
    }

    return createRegexFromRegexPattern(matcher)
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
