import { expect, it, describe } from 'vitest'
import { generateMatcherRegex } from '@/util/matcher-regex'

describe('Case-Insensitive URL Matching', () => {
  it('matches name variations case-insensitively', () => {
    const regex = generateMatcherRegex('github.com/name/*')

    // Test all the variations mentioned in the requirement
    const variations = [
      'https://github.com/name/repo',
      'https://github.com/Name/repo',
      'https://github.com/NAME/repo',
      'https://github.com/NaMe/repo',
      'https://github.com/name/repo',
      'https://GITHUB.COM/name/repo',
      'https://GitHub.Com/Name/repo'
    ]

    for (const url of variations) {
      expect(regex.test(url)).toBe(true)
    }
  })

  it('matches domain names case-insensitively', () => {
    const regex = generateMatcherRegex('GitHub.Com')

    const domainVariations = [
      'https://github.com/',
      'https://GITHUB.COM/',
      'https://GitHub.Com/',
      'https://github.COM/',
      'https://GITHUB.com/',
      'http://github.com/',
      'http://GITHUB.COM/'
    ]

    for (const url of domainVariations) {
      expect(regex.test(url)).toBe(true)
    }
  })

  it('matches complex paths case-insensitively', () => {
    const regex = generateMatcherRegex('GitHub.com/AdarBahar/Auto-Group-Tabs/*')

    const pathVariations = [
      'https://github.com/adarbahar/auto-group-tabs/issues',
      'https://GITHUB.COM/ADARBAHAR/AUTO-GROUP-TABS/pulls',
      'https://GitHub.Com/AdarBahar/Auto-Group-Tabs/wiki',
      'https://github.com/adarBahar/auto-group-tabs/settings',
      'https://GITHUB.com/AdarBahar/AUTO-GROUP-TABS/releases'
    ]

    for (const url of pathVariations) {
      expect(regex.test(url)).toBe(true)
    }
  })

  it('still distinguishes between different users regardless of case', () => {
    const regex = generateMatcherRegex('github.com/name/*')

    // Should match name in any case
    expect(regex.test('https://github.com/NAME/repo')).toBe(true)
    expect(regex.test('https://github.com/Name/repo')).toBe(true)

    // Should NOT match different usernames
    expect(regex.test('https://github.com/microsoft/repo')).toBe(false)
    expect(regex.test('https://github.com/MICROSOFT/repo')).toBe(false)
    expect(regex.test('https://github.com/otheruser/repo')).toBe(false)
    expect(regex.test('https://github.com/OTHERUSER/repo')).toBe(false)
  })

  it('handles subdomain wildcards case-insensitively', () => {
    const regex = generateMatcherRegex('*.GitHub.Com')

    const subdomainVariations = [
      'https://api.github.com/',
      'https://API.GITHUB.COM/',
      'https://docs.GitHub.Com/',
      'https://DOCS.github.com/',
      'https://support.GITHUB.COM/'
    ]

    for (const url of subdomainVariations) {
      expect(regex.test(url)).toBe(true)
    }
  })

  it('works with protocol variations and case-insensitive domains', () => {
    const regex = generateMatcherRegex('Example.Com/User/*')

    const protocolVariations = [
      'http://example.com/user/page',
      'https://EXAMPLE.COM/USER/page',
      'http://Example.Com/User/page',
      'https://example.COM/user/page'
    ]

    for (const url of protocolVariations) {
      expect(regex.test(url)).toBe(true)
    }
  })

  it('demonstrates real-world GitHub username matching', () => {
    // Create patterns for different case styles that users might enter
    const patterns = [
      'github.com/name/*',
      'GitHub.com/Name/*',
      'GITHUB.COM/NAME/*'
    ]

    // All patterns should match the same URLs regardless of how they were entered
    const testUrl = 'https://github.com/Name/auto-group-tabs/issues'

    for (const pattern of patterns) {
      const regex = generateMatcherRegex(pattern)
      expect(regex.test(testUrl)).toBe(true)
    }
  })
})
