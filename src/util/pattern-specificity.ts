/**
 * Calculate the specificity score of a URL pattern
 * Higher scores indicate more specific patterns
 */
export function calculatePatternSpecificity(pattern: string): number {
  let score = 0
  
  // Base score for any pattern
  score += 1
  
  // Parse the pattern to understand its components
  try {
    // Handle patterns without protocol by adding a default one
    const normalizedPattern = pattern.includes('://') ? pattern : `https://${pattern}`
    new URL(normalizedPattern.replace(/\*/g, 'wildcard'))
  } catch {
    // If we can't parse it, give it a minimal score
    return score
  }
  
  // Score based on host specificity
  const host = pattern.includes('://')
    ? pattern.split('://')[1].split('/')[0]
    : pattern.split('/')[0]

  if (host === '*') {
    // Wildcard host - lowest specificity
    score += 1
  } else if (host.startsWith('*.')) {
    // Explicit subdomain wildcard - medium specificity
    score += 5
    // Add points for each domain level
    const domainParts = host.slice(2).split('.')
    score += domainParts.length * 2
  } else if (!host.includes('*')) {
    // Host without explicit wildcards - but may have smart wildcards
    const domainParts = host.split('.')
    const isBaseDomain = isBaseDomainForScoring(host)

    if (isBaseDomain) {
      // Base domain with smart wildcard - medium-high specificity
      score += 8
    } else {
      // Specific subdomain - highest specificity
      score += 12
    }

    // Add points for each domain level
    score += domainParts.length * 2
  }

  /**
   * Helper function to determine if a host is a base domain for scoring purposes
   * This mirrors the logic in matcher-regex.ts
   */
  function isBaseDomainForScoring(hostname: string): boolean {
    const hostWithoutPort = hostname.replace(/:[0-9]+$/, '')
    const parts = hostWithoutPort.split('.')

    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostWithoutPort)) return false
    if (parts.length <= 1) return false
    if (parts.length === 2) return true

    if (parts.length === 3) {
      const secondLevelDomain = parts[1]
      const topLevelDomain = parts[2]
      const commonSLDs = ['co', 'com', 'net', 'org', 'gov', 'edu', 'ac', 'mil']

      if (commonSLDs.includes(secondLevelDomain) && topLevelDomain.length === 2) {
        return true
      }
    }

    return false
  }
  
  // Score based on path specificity
  let pathPart = ''
  if (pattern.includes('://')) {
    // Pattern has protocol, extract path after host
    const parts = pattern.split('/')
    if (parts.length > 3) {
      pathPart = parts.slice(3).join('/')
    }
  } else {
    // Pattern without protocol, extract path after host
    const parts = pattern.split('/')
    if (parts.length > 1) {
      pathPart = parts.slice(1).join('/')
    }
  }

  if (pathPart) {
    if (pathPart === '*') {
      // Root path wildcard
      score += 2
    } else {
      // Count path segments for specificity
      const pathSegments = pathPart.split('/').filter(segment => segment && segment !== '*')
      score += pathSegments.length * 3

      // Bonus for exact path (no wildcards)
      if (!pathPart.includes('*')) {
        score += 5
      }
    }
  }
  
  // Protocol specificity
  if (pattern.startsWith('https://')) {
    score += 2
  } else if (pattern.startsWith('http://')) {
    score += 2
  } else if (pattern.includes('://') && !pattern.startsWith('*://')) {
    score += 3 // Specific protocol
  }
  
  return score
}

/**
 * Calculate the final priority score for a group match
 * Combines pattern specificity with user-defined priority
 */
export function calculateMatchScore(pattern: string, userPriority: number): number {
  const specificityScore = calculatePatternSpecificity(pattern)
  
  // User priority is multiplied by 10 to give it significant weight
  // This ensures user priority can override specificity when needed
  const priorityBonus = userPriority * 10
  
  return specificityScore + priorityBonus
}

/**
 * Find the best matching group for a URL from a list of potential matches
 */
export function findBestMatch(matches: Array<{ group: any, pattern: string }>): any {
  if (matches.length === 0) return null
  if (matches.length === 1) return matches[0].group
  
  let bestMatch = matches[0]
  let bestScore = calculateMatchScore(bestMatch.pattern, bestMatch.group.options.priority || 0)
  
  for (let i = 1; i < matches.length; i++) {
    const match = matches[i]
    const score = calculateMatchScore(match.pattern, match.group.options.priority || 0)
    
    if (score > bestScore) {
      bestScore = score
      bestMatch = match
    }
  }
  
  return bestMatch.group
}
