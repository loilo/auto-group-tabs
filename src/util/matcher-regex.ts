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

/**
 * Generate smart host pattern that automatically handles subdomains for base domains
 * but keeps specific subdomains exact
 */
function generateSmartHostPattern(host: string): string {
  // Extract port if present
  const portMatch = host.match(/:([0-9]+)$/)
  const hostWithoutPort = host.replace(/:[0-9]+$/, '')
  const parts = hostWithoutPort.split('.')

  // If it's an IP address, keep it exact
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostWithoutPort)) {
    return sanitizeRegex(host)
  }

  // If it's localhost or a single word, keep it exact
  if (parts.length <= 1) {
    return sanitizeRegex(host)
  }

  // Determine if this is a base domain or a specific subdomain
  const isBaseDomain = isBaseDomainName(hostWithoutPort)

  if (isBaseDomain) {
    // For base domains like "github.com", "haaretz.co.il", make it match subdomains too
    // This creates a pattern that matches both the domain and its subdomains
    let pattern = `(?:[^/]+\\.)?${sanitizeRegex(hostWithoutPort)}`

    // Add port back if it was present
    if (portMatch) {
      pattern += `:${portMatch[1]}`
    }

    return pattern
  } else {
    // For specific subdomains like "api.github.com", "test.haaretz.co.il", keep exact
    return sanitizeRegex(host)
  }
}

/**
 * Determine if a hostname is a base domain (like github.com, haaretz.co.il)
 * vs a specific subdomain (like api.github.com, test.haaretz.co.il)
 */
function isBaseDomainName(hostname: string): boolean {
  const parts = hostname.split('.')

  // Single word domains (localhost, etc.) are not base domains for our purposes
  if (parts.length <= 1) {
    return false
  }

  // Two parts (.com, .org, .net, etc.) - likely a base domain
  if (parts.length === 2) {
    return true
  }

  // Three parts - check if it's a country code TLD (.co.il, .co.uk, etc.)
  if (parts.length === 3) {
    const secondLevelDomain = parts[1]
    const topLevelDomain = parts[2]

    // Common second-level domains that indicate this is a base domain
    const commonSLDs = ['co', 'com', 'net', 'org', 'gov', 'edu', 'ac', 'mil']

    // If it matches the pattern of country code domains, treat as base domain
    if (commonSLDs.includes(secondLevelDomain) && topLevelDomain.length === 2) {
      return true
    }
  }

  // Four or more parts - likely a subdomain (api.github.com, test.example.co.uk)
  return false
}

  const matcherPatternRegex = new RegExp(matcherPattern)

  const result = matcher.match(matcherPatternRegex)

  if (!result) {
    throw new Error('Invalid matcher: ' + matcher)
  }

  // Shortcut for catch-all matchers
  if (matcher === '*') return /^.*$/i

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
      // Format: *.host (explicit wildcard) - requires a subdomain
      hostPattern = generatePatternString(`*${host.slice(2)}`, '[^/]+\\.')
    } else {
      // Format: host - apply smart wildcard logic
      hostPattern = generateSmartHostPattern(host)
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

  return new RegExp(`^${schemePattern}://${hostPattern}${pathPattern}$`, 'i')
}
