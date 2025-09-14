import { expect, it, describe } from 'vitest'
import { generateMatcherRegex } from '@/util/matcher-regex'
import { findBestMatch, calculateMatchScore, calculatePatternSpecificity } from '@/util/pattern-specificity'
import { GroupConfiguration } from '@/util/types'

describe('Debug Priority Matching Issues', () => {
  it('debugs github.com/* vs github.com/adarbahar/* priority issue', () => {
    // Simulate the exact scenario from the user's test
    const groups: GroupConfiguration[] = [
      {
        id: '1',
        title: 'Github',
        color: 'blue',
        matchers: ['github.com/*'],
        options: { strict: false, merge: true, priority: 0 }
      },
      {
        id: '2',
        title: 'My Code',
        color: 'green',
        matchers: ['github.com/adarbahar/*'],
        options: { strict: false, merge: true, priority: 20 }
      }
    ]

    const testUrl = 'https://github.com/adarbahar/repo'
    
    // Test that both patterns match
    const regex1 = generateMatcherRegex('github.com/*')
    const regex2 = generateMatcherRegex('github.com/adarbahar/*')
    
    console.log('Pattern 1 (github.com/*):', regex1)
    console.log('Pattern 2 (github.com/adarbahar/*):', regex2)
    console.log('Test URL:', testUrl)
    console.log('Pattern 1 matches:', regex1.test(testUrl))
    console.log('Pattern 2 matches:', regex2.test(testUrl))
    
    expect(regex1.test(testUrl)).toBe(true)
    expect(regex2.test(testUrl)).toBe(true)
    
    // Calculate specificity scores
    const spec1 = calculatePatternSpecificity('github.com/*')
    const spec2 = calculatePatternSpecificity('github.com/adarbahar/*')
    
    console.log('Specificity github.com/*:', spec1)
    console.log('Specificity github.com/adarbahar/*:', spec2)
    
    // Calculate match scores
    const score1 = calculateMatchScore('github.com/*', 0)
    const score2 = calculateMatchScore('github.com/adarbahar/*', 20)
    
    console.log('Score github.com/* (priority 0):', score1)
    console.log('Score github.com/adarbahar/* (priority 20):', score2)
    
    // Test findBestMatch
    const matches = [
      { group: groups[0], pattern: 'github.com/*' },
      { group: groups[1], pattern: 'github.com/adarbahar/*' }
    ]
    
    const bestMatch = findBestMatch(matches)
    console.log('Best match:', bestMatch?.title)
    
    // The higher priority should win
    expect(bestMatch?.title).toBe('My Code')
    expect(score2).toBeGreaterThan(score1)
  })

  it('debugs why tabs might not be reassigned', () => {
    // Test the scenario where tabs are already in a group
    // and need to be moved to a higher priority group
    
    const generalPattern = 'github.com/*'
    const specificPattern = 'github.com/adarbahar/*'
    const testUrl = 'https://github.com/adarbahar/repo'
    
    // Both patterns should match
    const generalRegex = generateMatcherRegex(generalPattern)
    const specificRegex = generateMatcherRegex(specificPattern)
    
    expect(generalRegex.test(testUrl)).toBe(true)
    expect(specificRegex.test(testUrl)).toBe(true)
    
    // Scores should favor the specific pattern with high priority
    const generalScore = calculateMatchScore(generalPattern, 0)
    const specificScore = calculateMatchScore(specificPattern, 20)
    
    console.log('General pattern score:', generalScore)
    console.log('Specific pattern score:', specificScore)
    
    expect(specificScore).toBeGreaterThan(generalScore)
    
    // The difference should be significant (20 * 10 = 200 priority bonus)
    expect(specificScore - generalScore).toBeGreaterThanOrEqual(200)
  })

  it('tests pattern specificity calculation details', () => {
    const patterns = [
      'github.com',
      'github.com/*',
      'github.com/adarbahar/*',
      'github.com/adarbahar/repo/*'
    ]
    
    console.log('\nPattern specificity breakdown:')
    for (const pattern of patterns) {
      const score = calculatePatternSpecificity(pattern)
      console.log(`${pattern}: ${score}`)
    }
    
    // More specific patterns should have higher scores
    const scores = patterns.map(calculatePatternSpecificity)
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThan(scores[i-1])
    }
  })

  it('simulates the exact background.ts matching logic', () => {
    // This simulates what happens in getGroupConfigurationForTab
    const groups: GroupConfiguration[] = [
      {
        id: '1',
        title: 'Github',
        color: 'blue',
        matchers: ['github.com/*'],
        options: { strict: false, merge: true, priority: 0 }
      },
      {
        id: '2',
        title: 'My Code',
        color: 'green',
        matchers: ['github.com/adarbahar/*'],
        options: { strict: false, merge: true, priority: 20 }
      }
    ]

    const testUrl = 'https://github.com/adarbahar/repo'
    const matches: Array<{ group: GroupConfiguration, pattern: string }> = []
    
    // Simulate the matching logic from background.ts
    for (const group of groups) {
      for (const pattern of group.matchers) {
        try {
          const regex = generateMatcherRegex(pattern)
          if (regex.test(testUrl)) {
            matches.push({ group, pattern })
            console.log(`Match found: ${pattern} from group "${group.title}" (priority: ${group.options.priority})`)
          }
        } catch (error) {
          console.log(`Error with pattern ${pattern}:`, error)
        }
      }
    }
    
    console.log(`Total matches: ${matches.length}`)
    
    // Should find both matches
    expect(matches.length).toBe(2)
    
    // Find best match
    const bestMatch = findBestMatch(matches)
    console.log(`Best match: ${bestMatch?.title}`)
    
    // Should select the higher priority group
    expect(bestMatch?.title).toBe('My Code')
  })
})
