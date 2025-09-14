import { expect, it, describe } from 'vitest'
import { deriveMatcherOptions } from '@/util/derive-matcher-options'

// Mock translation object
const mockMsg = {
  derivedNameGenericExactUrl: 'This exact URL',
  derivedNameHttpDomain: 'This domain',
  derivedNameHttpSubdomain: 'This domain and its subdomains'
} as any

describe('deriveMatcherOptions for www subdomain handling', () => {
  it('suggests smart wildcard patterns for non-www URLs', () => {
    const options = deriveMatcherOptions('https://haaretz.co.il/news', mockMsg)

    // Should include patterns that handle www variations with smart wildcards
    const patterns = options.flatMap(option => option.patterns)

    // With smart wildcards, haaretz.co.il automatically includes www
    expect(patterns).toContain('haaretz.co.il')
    // Should also suggest path-based patterns
    expect(patterns).toContain('haaretz.co.il/news/*')

    console.log('Patterns for haaretz.co.il:', patterns)
  })

  it('suggests smart patterns for www URLs', () => {
    const options = deriveMatcherOptions('https://www.haaretz.co.il/news', mockMsg)

    const patterns = options.flatMap(option => option.patterns)

    // Should suggest base domain (which includes www with smart wildcards)
    expect(patterns).toContain('haaretz.co.il') // base domain (includes www automatically)
    expect(patterns).toContain('www.haaretz.co.il') // exact www

    console.log('Patterns for www.haaretz.co.il:', patterns)
  })

  it('generates hierarchical GitHub patterns with smart wildcards', () => {
    const options = deriveMatcherOptions('https://github.com/adarbahar/repo/issues', mockMsg)

    const patterns = options.flatMap(option => option.patterns)

    // Should include hierarchical patterns
    expect(patterns).toContain('github.com/adarbahar/repo/issues/*')
    expect(patterns).toContain('github.com/adarbahar/repo/*')
    expect(patterns).toContain('github.com/adarbahar/*')
    expect(patterns).toContain('github.com') // Smart wildcard includes subdomains automatically

    console.log('Patterns for GitHub URL:', patterns)
  })

  it('provides clear descriptions for www patterns', () => {
    const options = deriveMatcherOptions('https://www.example.com/', mockMsg)
    
    // Find the www-related options
    const wwwOptions = options.filter(option => 
      option.description.includes('www') || 
      option.description.includes('subdomain')
    )
    
    expect(wwwOptions.length).toBeGreaterThan(0)
    
    console.log('WWW-related options:', wwwOptions)
  })

  it('handles edge cases correctly with smart wildcards', () => {
    // Test with already complex subdomain
    const options1 = deriveMatcherOptions('https://api.github.com/users', mockMsg)
    const patterns1 = options1.flatMap(option => option.patterns)

    expect(patterns1).toContain('api.github.com') // Specific subdomain (exact)
    expect(patterns1).toContain('github.com') // Base domain suggestion

    // Test with port
    const options2 = deriveMatcherOptions('https://localhost:3000/app', mockMsg)
    const patterns2 = options2.flatMap(option => option.patterns)

    expect(patterns2).toContain('localhost:3000')

    console.log('API subdomain patterns:', patterns1)
    console.log('Localhost with port patterns:', patterns2)
  })
})
