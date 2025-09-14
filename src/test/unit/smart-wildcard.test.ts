import { expect, it, describe } from 'vitest'
import { generateMatcherRegex } from '@/util/matcher-regex'

describe('Smart Wildcard Host Matching', () => {
  describe('Base domains automatically include subdomains', () => {
    it('matches cnn.com with and without www', () => {
      const regex = generateMatcherRegex('cnn.com')

      // Should match both www and non-www
      expect(regex.test('https://cnn.com/')).toBe(true)
      expect(regex.test('https://www.cnn.com/')).toBe(true)
      expect(regex.test('http://cnn.com/')).toBe(true)
      expect(regex.test('http://www.cnn.com/')).toBe(true)

      // Should also match other subdomains
      expect(regex.test('https://m.cnn.com/')).toBe(true)
      expect(regex.test('https://mobile.cnn.com/')).toBe(true)

      // Should not match different domains
      expect(regex.test('https://bbc.com/')).toBe(false)
      expect(regex.test('https://cnn.co.uk/')).toBe(false)
    })

    it('matches github.com with and without www', () => {
      const regex = generateMatcherRegex('github.com')
      
      // Should match both www and non-www
      expect(regex.test('https://github.com/')).toBe(true)
      expect(regex.test('https://www.github.com/')).toBe(true)
      
      // Should also match other subdomains
      expect(regex.test('https://api.github.com/')).toBe(true)
      expect(regex.test('https://docs.github.com/')).toBe(true)
      expect(regex.test('https://support.github.com/')).toBe(true)
      
      // Should not match different domains
      expect(regex.test('https://gitlab.com/')).toBe(false)
    })

    it('handles other common TLDs', () => {
      const regexCom = generateMatcherRegex('example.com')
      expect(regexCom.test('https://example.com/')).toBe(true)
      expect(regexCom.test('https://www.example.com/')).toBe(true)
      expect(regexCom.test('https://api.example.com/')).toBe(true)

      const regexOrg = generateMatcherRegex('wikipedia.org')
      expect(regexOrg.test('https://wikipedia.org/')).toBe(true)
      expect(regexOrg.test('https://en.wikipedia.org/')).toBe(true)
      expect(regexOrg.test('https://fr.wikipedia.org/')).toBe(true)
    })
  })

  describe('Specific subdomains remain exact', () => {
    it('keeps api.github.com exact', () => {
      const regex = generateMatcherRegex('api.github.com')
      
      // Should match the exact subdomain
      expect(regex.test('https://api.github.com/')).toBe(true)
      expect(regex.test('http://api.github.com/')).toBe(true)
      
      // Should NOT match other subdomains
      expect(regex.test('https://github.com/')).toBe(false)
      expect(regex.test('https://www.github.com/')).toBe(false)
      expect(regex.test('https://docs.github.com/')).toBe(false)
      expect(regex.test('https://support.github.com/')).toBe(false)
    })

    it('keeps test.cnn.com exact', () => {
      const regex = generateMatcherRegex('test.cnn.com')

      // Should match the exact subdomain
      expect(regex.test('https://test.cnn.com/')).toBe(true)

      // Should NOT match other subdomains or the base domain
      expect(regex.test('https://cnn.com/')).toBe(false)
      expect(regex.test('https://www.cnn.com/')).toBe(false)
      expect(regex.test('https://m.cnn.com/')).toBe(false)
      expect(regex.test('https://staging.cnn.com/')).toBe(false)
    })

    it('handles complex subdomains', () => {
      const regex = generateMatcherRegex('admin.staging.example.com')
      
      // Should match the exact complex subdomain
      expect(regex.test('https://admin.staging.example.com/')).toBe(true)
      
      // Should NOT match partial matches
      expect(regex.test('https://staging.example.com/')).toBe(false)
      expect(regex.test('https://example.com/')).toBe(false)
      expect(regex.test('https://admin.example.com/')).toBe(false)
    })
  })

  describe('Special cases', () => {
    it('handles localhost correctly', () => {
      const regex = generateMatcherRegex('localhost')
      
      // Should match localhost exactly (no smart wildcard for single words)
      expect(regex.test('http://localhost/')).toBe(true)
      expect(regex.test('http://localhost:3000/')).toBe(true)
      
      // Should not match subdomains of localhost
      expect(regex.test('http://api.localhost/')).toBe(false)
    })

    it('handles IP addresses correctly', () => {
      const regex = generateMatcherRegex('192.168.1.1')
      
      // Should match IP exactly (no smart wildcard for IPs)
      expect(regex.test('http://192.168.1.1/')).toBe(true)
      expect(regex.test('http://192.168.1.1:8080/')).toBe(true)
      
      // Should not match different IPs
      expect(regex.test('http://192.168.1.2/')).toBe(false)
    })

    it('handles ports correctly', () => {
      const regex = generateMatcherRegex('example.com:8080')
      
      // Should match with the specific port
      expect(regex.test('https://example.com:8080/')).toBe(true)
      expect(regex.test('https://www.example.com:8080/')).toBe(true)
      
      // Should not match without port or different port
      expect(regex.test('https://example.com/')).toBe(false)
      expect(regex.test('https://example.com:3000/')).toBe(false)
    })

    it('preserves explicit wildcard behavior', () => {
      const regex = generateMatcherRegex('*.github.com')
      
      // Should match subdomains but NOT the base domain
      expect(regex.test('https://api.github.com/')).toBe(true)
      expect(regex.test('https://docs.github.com/')).toBe(true)
      expect(regex.test('https://www.github.com/')).toBe(true)
      
      // Should NOT match the base domain (explicit wildcard behavior)
      expect(regex.test('https://github.com/')).toBe(false)
    })
  })

  describe('Real-world scenarios', () => {
    it('solves the original cnn problem', () => {
      // User creates group with pattern: cnn.com
      // Should now work for both www and non-www automatically
      const regex = generateMatcherRegex('cnn.com')

      expect(regex.test('https://cnn.com/news/politics')).toBe(true)
      expect(regex.test('https://www.cnn.com/news/politics')).toBe(true)

      console.log('✅ CNN problem solved! Pattern "cnn.com" now matches both www and non-www')
    })

    it('handles GitHub user patterns correctly', () => {
      // Base domain should include all subdomains
      const githubRegex = generateMatcherRegex('github.com')
      expect(githubRegex.test('https://github.com/name/repo')).toBe(true)
      expect(githubRegex.test('https://api.github.com/users')).toBe(true)

      // Specific subdomain should be exact
      const apiRegex = generateMatcherRegex('api.github.com')
      expect(apiRegex.test('https://api.github.com/users')).toBe(true)
      expect(apiRegex.test('https://github.com/name/repo')).toBe(false)
    })

    it('handles news sites with country TLDs', () => {
      const bbcRegex = generateMatcherRegex('bbc.co.uk')
      expect(bbcRegex.test('https://bbc.co.uk/')).toBe(true)
      expect(bbcRegex.test('https://www.bbc.co.uk/')).toBe(true)
      expect(bbcRegex.test('https://news.bbc.co.uk/')).toBe(true)
      
      const specificRegex = generateMatcherRegex('news.bbc.co.uk')
      expect(specificRegex.test('https://news.bbc.co.uk/')).toBe(true)
      expect(specificRegex.test('https://bbc.co.uk/')).toBe(false)
    })
  })
})
