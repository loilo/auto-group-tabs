import { expect, it, describe } from 'vitest'
import { generateMatcherRegex } from '@/util/matcher-regex'
import { findBestMatch } from '@/util/pattern-specificity'
import { GroupConfiguration } from '@/util/types'

describe('Hierarchical Matching Integration', () => {
  // Mock group configurations for GitHub example
  const githubGroups: GroupConfiguration[] = [
    {
      id: '1',
      title: 'GitHub General',
      color: 'blue',
      matchers: ['github.com'],
      options: { strict: false, merge: true, priority: 0 }
    },
    {
      id: '2',
      title: 'My GitHub',
      color: 'green',
      matchers: ['github.com/name/*'],
      options: { strict: false, merge: true, priority: 10 }
    },
    {
      id: '3',
      title: 'Auto-Group-Tabs Project',
      color: 'red',
      matchers: ['github.com/name/auto-group-tabs/*'],
      options: { strict: true, merge: true, priority: 20 }
    }
  ]

  function simulateTabMatching(url: string, groups: GroupConfiguration[]) {
    const matches: Array<{ group: GroupConfiguration, pattern: string }> = []
    
    for (const group of groups) {
      for (const pattern of group.matchers) {
        try {
          const regex = generateMatcherRegex(pattern)
          if (regex.test(url)) {
            matches.push({ group, pattern })
          }
        } catch {
          // Skip invalid patterns
        }
      }
    }
    
    return findBestMatch(matches)
  }

  it('routes specific project URLs to project group', () => {
    const url = 'https://github.com/name/auto-group-tabs/issues'
    const result = simulateTabMatching(url, githubGroups)

    expect(result?.title).toBe('Auto-Group-Tabs Project')
  })

  it('routes user URLs to user group', () => {
    const url = 'https://github.com/name/other-repo'
    const result = simulateTabMatching(url, githubGroups)

    expect(result?.title).toBe('My GitHub')
  })

  it('routes general GitHub URLs to general group', () => {
    const url = 'https://github.com/microsoft/vscode'
    const result = simulateTabMatching(url, githubGroups)
    
    expect(result?.title).toBe('GitHub General')
  })

  it('handles priority override scenario', () => {
    const priorityGroups: GroupConfiguration[] = [
      {
        id: '1',
        title: 'High Priority General',
        color: 'blue',
        matchers: ['github.com'],
        options: { strict: false, merge: true, priority: 50 }
      },
      {
        id: '2',
        title: 'Low Priority Specific',
        color: 'red',
        matchers: ['github.com/name/specific-project/*'],
        options: { strict: false, merge: true, priority: 0 }
      }
    ]

    const url = 'https://github.com/name/specific-project/issues'
    const result = simulateTabMatching(url, priorityGroups)
    
    // High priority general rule should win
    expect(result?.title).toBe('High Priority General')
  })

  it('handles complex path hierarchies', () => {
    const complexGroups: GroupConfiguration[] = [
      {
        id: '1',
        title: 'All Docs',
        color: 'blue',
        matchers: ['*.dev/docs/*'],
        options: { strict: false, merge: true, priority: 0 }
      },
      {
        id: '2',
        title: 'Vue Docs',
        color: 'green',
        matchers: ['vuejs.org/guide/*'],
        options: { strict: false, merge: true, priority: 10 }
      },
      {
        id: '3',
        title: 'Vue API Reference',
        color: 'red',
        matchers: ['vuejs.org/api/*'],
        options: { strict: false, merge: true, priority: 15 }
      }
    ]

    // Test Vue guide
    let url = 'https://vuejs.org/guide/introduction.html'
    let result = simulateTabMatching(url, complexGroups)
    expect(result?.title).toBe('Vue Docs')

    // Test Vue API
    url = 'https://vuejs.org/api/composition-api.html'
    result = simulateTabMatching(url, complexGroups)
    expect(result?.title).toBe('Vue API Reference')

    // Test other docs site
    url = 'https://react.dev/docs/getting-started'
    result = simulateTabMatching(url, complexGroups)
    expect(result?.title).toBe('All Docs')
  })

  it('handles no matches gracefully', () => {
    const url = 'https://example.com'
    const result = simulateTabMatching(url, githubGroups)
    
    expect(result).toBeNull()
  })

  it('handles equal priority by specificity', () => {
    const equalPriorityGroups: GroupConfiguration[] = [
      {
        id: '1',
        title: 'General',
        color: 'blue',
        matchers: ['github.com'],
        options: { strict: false, merge: true, priority: 5 }
      },
      {
        id: '2',
        title: 'Specific',
        color: 'red',
        matchers: ['github.com/user/repo/*'],
        options: { strict: false, merge: true, priority: 5 }
      }
    ]

    const url = 'https://github.com/user/repo/issues'
    const result = simulateTabMatching(url, equalPriorityGroups)

    // More specific pattern should win when priorities are equal
    expect(result?.title).toBe('Specific')
  })

  it('handles case-insensitive matching for usernames', () => {
    const caseGroups: GroupConfiguration[] = [
      {
        id: '1',
        title: 'GitHub General',
        color: 'blue',
        matchers: ['github.com'],
        options: { strict: false, merge: true, priority: 0 }
      },
      {
        id: '2',
        title: 'Name Projects',
        color: 'green',
        matchers: ['github.com/Name/*'],
        options: { strict: false, merge: true, priority: 10 }
      }
    ]

    // Test various case combinations of the username
    const testUrls = [
      'https://github.com/name/repo',
      'https://github.com/NAME/repo',
      'https://github.com/Name/repo',
      'https://github.com/NaMe/repo'
    ]

    for (const url of testUrls) {
      const result = simulateTabMatching(url, caseGroups)
      expect(result?.title).toBe('Name Projects')
    }

    // Different user should still go to general
    const otherUserUrl = 'https://github.com/microsoft/vscode'
    const otherResult = simulateTabMatching(otherUserUrl, caseGroups)
    expect(otherResult?.title).toBe('GitHub General')
  })

  it('handles case-insensitive domain matching', () => {
    const domainGroups: GroupConfiguration[] = [
      {
        id: '1',
        title: 'GitHub',
        color: 'blue',
        matchers: ['GitHub.Com'],
        options: { strict: false, merge: true, priority: 0 }
      }
    ]

    const testUrls = [
      'https://github.com/user/repo',
      'https://GITHUB.COM/user/repo',
      'https://GitHub.Com/user/repo',
      'https://github.COM/user/repo'
    ]

    for (const url of testUrls) {
      const result = simulateTabMatching(url, domainGroups)
      expect(result?.title).toBe('GitHub')
    }
  })
})
