import { expect, it, describe } from 'vitest'
import { 
  calculatePatternSpecificity, 
  calculateMatchScore, 
  findBestMatch 
} from '@/util/pattern-specificity'

describe('calculatePatternSpecificity', () => {
  it('calculates basic domain specificity', () => {
    expect(calculatePatternSpecificity('github.com')).toBeGreaterThan(
      calculatePatternSpecificity('*.github.com')
    )
    expect(calculatePatternSpecificity('*.github.com')).toBeGreaterThan(
      calculatePatternSpecificity('*')
    )
  })

  it('calculates path specificity correctly', () => {
    const domainOnly = calculatePatternSpecificity('github.com')
    const withPath = calculatePatternSpecificity('github.com/user/*')
    const withDeepPath = calculatePatternSpecificity('github.com/user/repo/*')

    expect(withDeepPath).toBeGreaterThan(withPath)
    expect(withPath).toBeGreaterThan(domainOnly)
  })

  it('handles exact URLs with highest specificity', () => {
    const exactUrl = calculatePatternSpecificity('https://github.com/user/repo/issues/123')
    const pathPattern = calculatePatternSpecificity('github.com/user/repo/*')
    const domainPattern = calculatePatternSpecificity('github.com')
    
    expect(exactUrl).toBeGreaterThan(pathPattern)
    expect(pathPattern).toBeGreaterThan(domainPattern)
  })

  it('handles protocol specificity', () => {
    const httpsPattern = calculatePatternSpecificity('https://github.com')
    const httpPattern = calculatePatternSpecificity('http://github.com')
    const noProtocolPattern = calculatePatternSpecificity('github.com')
    
    expect(httpsPattern).toBeGreaterThan(noProtocolPattern)
    expect(httpPattern).toBeGreaterThan(noProtocolPattern)
  })
})

describe('calculateMatchScore', () => {
  it('combines specificity with user priority', () => {
    const pattern = 'github.com/user/*'
    const lowPriority = calculateMatchScore(pattern, 0)
    const highPriority = calculateMatchScore(pattern, 10)
    
    expect(highPriority).toBeGreaterThan(lowPriority)
    expect(highPriority - lowPriority).toBe(100) // 10 * 10
  })

  it('allows user priority to override specificity', () => {
    const specificPattern = 'github.com/user/repo/issues/*'
    const generalPattern = 'github.com'
    
    const specificLowPriority = calculateMatchScore(specificPattern, 0)
    const generalHighPriority = calculateMatchScore(generalPattern, 20)
    
    expect(generalHighPriority).toBeGreaterThan(specificLowPriority)
  })
})

describe('findBestMatch', () => {
  it('returns null for empty matches', () => {
    expect(findBestMatch([])).toBeNull()
  })

  it('returns single match', () => {
    const group = { title: 'Test', options: { priority: 0 } }
    const matches = [{ group, pattern: 'github.com' }]
    
    expect(findBestMatch(matches)).toBe(group)
  })

  it('selects highest priority match', () => {
    const lowPriorityGroup = { title: 'Low', options: { priority: 0 } }
    const highPriorityGroup = { title: 'High', options: { priority: 10 } }
    
    const matches = [
      { group: lowPriorityGroup, pattern: 'github.com/user/repo/*' },
      { group: highPriorityGroup, pattern: 'github.com' }
    ]
    
    expect(findBestMatch(matches)).toBe(highPriorityGroup)
  })

  it('selects most specific match when priorities are equal', () => {
    const generalGroup = { title: 'General', options: { priority: 5 } }
    const specificGroup = { title: 'Specific', options: { priority: 5 } }
    
    const matches = [
      { group: generalGroup, pattern: 'github.com' },
      { group: specificGroup, pattern: 'github.com/user/repo/*' }
    ]
    
    expect(findBestMatch(matches)).toBe(specificGroup)
  })
})

describe('hierarchical matching examples', () => {
  it('handles GitHub example from requirements', () => {
    const generalGroup = { title: 'GitHub General', options: { priority: 0 } }
    const userGroup = { title: 'My GitHub', options: { priority: 10 } }
    const projectGroup = { title: 'Auto-Group-Tabs Project', options: { priority: 20 } }
    
    const matches = [
      { group: generalGroup, pattern: 'github.com' },
      { group: userGroup, pattern: 'github.com/adarbahar/*' },
      { group: projectGroup, pattern: 'github.com/adarbahar/auto-group-tabs/*' }
    ]
    
    // Should select the project group due to highest priority
    expect(findBestMatch(matches)).toBe(projectGroup)
  })

  it('handles priority override scenario', () => {
    const generalHighPriority = { title: 'GitHub Important', options: { priority: 50 } }
    const specificLowPriority = { title: 'Specific Project', options: { priority: 0 } }
    
    const matches = [
      { group: generalHighPriority, pattern: 'github.com' },
      { group: specificLowPriority, pattern: 'github.com/user/specific-project/*' }
    ]
    
    // High priority general rule should win
    expect(findBestMatch(matches)).toBe(generalHighPriority)
  })
})
