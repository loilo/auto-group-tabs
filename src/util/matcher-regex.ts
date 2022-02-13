import { matcherPattern, sanitizeRegex } from '@/util/helpers'

/**
 * Generate a regular expression from a matcher string
 */
export function generateMatcherRegex(matcher: string) {
  /**
   * Replace asterisks in a regex string
   */
  function generatePatternString(string: string, asteriskReplacement: string) {
    return string.split('*').map(sanitizeRegex).join(asteriskReplacement)
  }

  const matcherPatternRegex = new RegExp(`^${matcherPattern}$`)

  const result = matcher.match(matcherPatternRegex)

  if (!result) {
    throw new Error('Invalid matcher: ' + matcher)
  }

  const { scheme, host, path } = result.groups ?? {}

  const schemePattern =
    typeof scheme === 'string'
      ? generatePatternString(scheme, 'https?')
      : 'https?|file|ftp'
  const hostPattern =
    typeof host === 'string'
      ? generatePatternString(
          host.startsWith('*.') ? `*${host.slice(2)}` : host,
          host === '*' ? '[^/]+.[^/]+|localhost(:[0-9]+)?' : '([^/]+.)?'
        )
      : '[^/]+.[^/]+'
  const pathPattern =
    typeof path === 'string' ? generatePatternString(path, '.*') : '.*'

  return new RegExp(`^(${schemePattern})://(${hostPattern})(/${pathPattern})?$`)
}
