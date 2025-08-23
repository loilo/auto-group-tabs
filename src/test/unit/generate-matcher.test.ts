import { expect, describe, it } from 'vitest'
import { generateMatcherRegex } from '@/util/matcher-regex'

it('handles no-wildcard domain pattern', () => {
  const regex = generateMatcherRegex('example.com')

  expect(regex.test('http://example.com/')).toBe(true)
  expect(regex.test('https://example.com/')).toBe(true)

  expect(regex.test('ftp://example.com/')).toBe(false)
  expect(regex.test('file:///example.com/')).toBe(false)
  expect(regex.test('https://www.example.com/')).toBe(false)
  expect(regex.test('http://invalid.com/')).toBe(false)
})

it('handles no-wildcard scheme + host', () => {
  const regex = generateMatcherRegex('https://example.com')

  expect(regex.test('https://example.com/')).toBe(true)

  expect(regex.test('http://example.com/')).toBe(false)
  expect(regex.test('ftp://example.com/')).toBe(false)
  expect(regex.test('ws://example.com/')).toBe(false)
  expect(regex.test('https://www.example.com/')).toBe(false)
  expect(regex.test('http://invalid.com/')).toBe(false)
})

it('handles no-wildcard scheme + host + root path', () => {
  const regex = generateMatcherRegex('https://example.com/')

  expect(regex.test('https://example.com/')).toBe(true)

  expect(regex.test('http://example.com/')).toBe(false)
  expect(regex.test('ftp://example.com/')).toBe(false)
  expect(regex.test('ws://example.com/')).toBe(false)
  expect(regex.test('https://www.example.com/')).toBe(false)
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

describe('handles host wildcards', () => {
  it('subdomain wildcard', () => {
    const regex = generateMatcherRegex('*.example.com')

    expect(regex.test('http://example.com/')).toBe(true)
    expect(regex.test('https://example.com/')).toBe(true)
    expect(regex.test('https://example.com/with/path/')).toBe(true)

    expect(regex.test('ftp://example.com/')).toBe(false)
    expect(regex.test('http://invalid.com/')).toBe(false)
    expect(regex.test('https://invalid.com/')).toBe(false)
  })

  it('domain wildcard', () => {
    const regex = generateMatcherRegex('*.com')

    expect(regex.test('http://example.com/')).toBe(true)
    expect(regex.test('https://example.com/')).toBe(true)
    expect(regex.test('https://example.com/with/path/')).toBe(true)

    expect(regex.test('ftp://example.com/')).toBe(false)
    expect(regex.test('http://example.de/')).toBe(false)
    expect(regex.test('https://example.de/')).toBe(false)
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

it('allows for regular expressions', () => {
  const regex = generateMatcherRegex('/^fo.?/i')

  expect(regex.test('foo')).toBe(true)
  expect(regex.test('Foo')).toBe(true)
  expect(regex.test('fo')).toBe(true)

  expect(regex.test('iFoo')).toBe(false)
  expect(regex.test('ufo')).toBe(false)
})
