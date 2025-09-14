import { expect, it } from 'vitest'
import { generateMatcherRegex } from '@/util/matcher-regex'

it('handles no-wildcard domain pattern with smart wildcards', () => {
  const regex = generateMatcherRegex('example.com')

  expect(regex.test('http://example.com/')).toBe(true)
  expect(regex.test('https://example.com/')).toBe(true)

  expect(regex.test('ftp://example.com/')).toBe(false)
  expect(regex.test('file:///example.com/')).toBe(false)
  // Smart wildcard: base domains now include subdomains automatically
  expect(regex.test('https://www.example.com/')).toBe(true)
  expect(regex.test('http://invalid.com/')).toBe(false)
})

it('handles no-wildcard scheme + host with smart wildcards', () => {
  const regex = generateMatcherRegex('https://example.com')

  expect(regex.test('https://example.com/')).toBe(true)

  expect(regex.test('http://example.com/')).toBe(false)
  expect(regex.test('ftp://example.com/')).toBe(false)
  expect(regex.test('ws://example.com/')).toBe(false)
  // Smart wildcard: base domains now include subdomains automatically
  expect(regex.test('https://www.example.com/')).toBe(true)
  expect(regex.test('http://invalid.com/')).toBe(false)
})

it('handles no-wildcard scheme + host + root path with smart wildcards', () => {
  const regex = generateMatcherRegex('https://example.com/')

  expect(regex.test('https://example.com/')).toBe(true)

  expect(regex.test('http://example.com/')).toBe(false)
  expect(regex.test('ftp://example.com/')).toBe(false)
  expect(regex.test('ws://example.com/')).toBe(false)
  // Smart wildcard: base domains now include subdomains automatically
  expect(regex.test('https://www.example.com/')).toBe(true)
  expect(regex.test('http://invalid.com/')).toBe(false)
})

it('handles match-all pattern', () => {
  const regex = generateMatcherRegex('*')

  expect(regex.test('')).toBe(true)
  expect(regex.test('chrome://settings')).toBe(true)
  expect(regex.test('file:///')).toBe(true)
  expect(regex.test('data:text/plain;charset=utf8,')).toBe(true)

  expect(regex.test('http://example.com/')).toBe(true)
  expect(regex.test('https://example.com/')).toBe(true)
  expect(regex.test('https://example.com:8080/')).toBe(true)
  expect(regex.test('https://subdomain.example.com/')).toBe(true)
  expect(regex.test('https://example.com:8080/')).toBe(true)
  expect(regex.test('https://example.com/path')).toBe(true)
  expect(regex.test('ftp://example.com/')).toBe(true)
})

it('handles scheme wildcard', () => {
  const regex = generateMatcherRegex('*://example.com')

  expect(regex.test('http://example.com/')).toBe(true)
  expect(regex.test('https://example.com/')).toBe(true)
  expect(regex.test('https://example.com/with/path/')).toBe(true)

  expect(regex.test('ftp://example.com/')).toBe(false)
  expect(regex.test('http://invalid.com/')).toBe(false)
  expect(regex.test('https://invalid.com/')).toBe(false)
})

it('handles host wildcards', () => {
  it('subdomain wildcard', () => {
    const regex = generateMatcherRegex('*.example.com')

    expect(regex.test('http://example.com/')).toBe(true)
    expect(regex.test('https://example.com/')).toBe(true)
    expect(regex.test('https://example.com/with/path/')).toBe(true)

    expect(regex.test('ftp://example.com/')).toBe(false)
    expect(regex.test('http://invalid.com/')).toBe(false)
    expect(regex.test('https://invalid.com/')).toBe(false)
  })

  it('arbitrary host wildcard', () => {
    const regex = generateMatcherRegex('ex*.com')

    expect(regex.test('http://example.com/')).toBe(true)
    expect(regex.test('https://example.com/')).toBe(true)
    expect(regex.test('https://exodus.com/')).toBe(true)
    expect(regex.test('https://example.com/with/path/')).toBe(true)

    expect(regex.test('ftp://example.com/')).toBe(false)
    expect(regex.test('http://invalid.com/')).toBe(false)
    expect(regex.test('https://invalid.com/')).toBe(false)
  })
})

it('handles path wildcard', () => {
  const regex = generateMatcherRegex('example.com/foo/*')

  expect(regex.test('https://example.com/foo/')).toBe(true)
  expect(regex.test('https://example.com/foo/bar/baz')).toBe(true)

  expect(regex.test('http://example.com/bar/')).toBe(false)
  expect(regex.test('ftp://example.com/bar/')).toBe(false)
  expect(regex.test('http://invalid.com/foo/')).toBe(false)
  expect(regex.test('https://invalid.com/foo/')).toBe(false)
})

it('handles simple scheme', () => {
  const regex = generateMatcherRegex('file:///foo/*')

  expect(regex.test('file:///foo/')).toBe(true)
  expect(regex.test('file:///foo/bar.txt')).toBe(true)

  expect(regex.test('file:///bar/baz')).toBe(false)
  expect(regex.test('https://example.com/foo/')).toBe(false)
  expect(regex.test('https://example.com/foo/bar/baz')).toBe(false)
  expect(regex.test('http://example.com/bar/')).toBe(false)
  expect(regex.test('ftp://example.com/bar/')).toBe(false)
  expect(regex.test('http://invalid.com/foo/')).toBe(false)
  expect(regex.test('https://invalid.com/foo/')).toBe(false)
})

it('handles case-insensitive matching', () => {
  const regex = generateMatcherRegex('GitHub.com/AdarBahar/*')

  // Test various case combinations
  expect(regex.test('https://github.com/adarbahar/repo')).toBe(true)
  expect(regex.test('https://GITHUB.COM/ADARBAHAR/repo')).toBe(true)
  expect(regex.test('https://GitHub.Com/AdarBahar/repo')).toBe(true)
  expect(regex.test('https://github.com/AdarBahar/repo')).toBe(true)
  expect(regex.test('https://github.com/adarbahar/repo')).toBe(true)
  expect(regex.test('https://GITHUB.com/adarBahar/repo')).toBe(true)

  // Should still not match different users
  expect(regex.test('https://github.com/microsoft/repo')).toBe(false)
  expect(regex.test('https://github.com/otheruser/repo')).toBe(false)
})

it('handles case-insensitive domain matching', () => {
  const regex = generateMatcherRegex('Example.Com')

  expect(regex.test('https://example.com/')).toBe(true)
  expect(regex.test('https://EXAMPLE.COM/')).toBe(true)
  expect(regex.test('https://Example.Com/')).toBe(true)
  expect(regex.test('https://EXAMPLE.com/')).toBe(true)
  expect(regex.test('http://example.COM/')).toBe(true)

  expect(regex.test('https://other.com/')).toBe(false)
})

it('handles www subdomain matching with smart wildcards', () => {
  // With smart wildcards, cnn.com now automatically includes www
  const regex1 = generateMatcherRegex('cnn.com')

  expect(regex1.test('https://cnn.com/')).toBe(true)
  expect(regex1.test('http://cnn.com/')).toBe(true)
  // Smart wildcard: now matches www automatically
  expect(regex1.test('https://www.cnn.com/')).toBe(true)

  // Explicit wildcard still works but requires subdomain
  const regex2 = generateMatcherRegex('*.cnn.com')
  expect(regex2.test('https://cnn.com/')).toBe(false) // Explicit wildcard requires subdomain
  expect(regex2.test('https://www.cnn.com/')).toBe(true)
})

it('handles github path matching correctly', () => {
  const generalRegex = generateMatcherRegex('github.com/*')
  const specificRegex = generateMatcherRegex('github.com/name/*')

  const testUrl = 'https://github.com/name/repo'

  // Both should match
  expect(generalRegex.test(testUrl)).toBe(true)
  expect(specificRegex.test(testUrl)).toBe(true)

  // Test that the patterns are different
  expect(generalRegex.source).not.toBe(specificRegex.source)
})

it('demonstrates smart wildcard solution for www subdomain matching', () => {
  // With smart wildcards, the user's issue is automatically solved
  // cnn.com now matches www.cnn.com automatically

  const smartRegex = generateMatcherRegex('cnn.com')
  const explicitWildcardRegex = generateMatcherRegex('*.cnn.com')

  // Smart wildcard: base domain now includes subdomains
  expect(smartRegex.test('https://cnn.com/')).toBe(true)
  expect(smartRegex.test('https://www.cnn.com/')).toBe(true)
  expect(smartRegex.test('https://m.cnn.com/')).toBe(true)

  // Explicit wildcard requires subdomain (doesn't match base domain)
  expect(explicitWildcardRegex.test('https://cnn.com/')).toBe(false)
  expect(explicitWildcardRegex.test('https://www.cnn.com/')).toBe(true)
  expect(explicitWildcardRegex.test('https://m.cnn.com/')).toBe(true)
})
