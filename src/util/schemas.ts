import { z } from 'zod'
import { matcherPattern } from './helpers'
import { colors } from './resources'

export const SaveOptionsSchema = z.object({
  strict: z.boolean().default(false),
  merge: z.boolean().default(false)
})

const matcherPatternRegex = new RegExp(matcherPattern)

// Define the schema for an individual matcher object
const MatcherObjectSchema = z.object({
  pattern: z.string(),
  isRegex: z.boolean().default(false)
});

export const GroupConfigurationSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  color: z.enum(colors),
  options: SaveOptionsSchema,
  matchers: z
    .array(z.union([MatcherObjectSchema, z.string()])) // Allow matchers to be string or MatcherObject
    .refine(
      matchers => {
        const patternStrings = matchers.map(m => typeof m === 'string' ? m : m.pattern);
        return new Set(patternStrings).size === patternStrings.length;
      },
      'Duplicate URL Patterns are not allowed'
    )
})
.superRefine((data, ctx) => {
  data.matchers.forEach((matcher, index) => {
    if (typeof matcher === 'object' && matcher.isRegex) {
      try {
        new RegExp(matcher.pattern); // Try to compile the regex
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid Regular Expression: ${(e as Error).message}`,
          path: ['matchers', index, 'pattern'] // Path to the specific pattern string
        });
      }
    } else if (typeof matcher === 'object' && !matcher.isRegex) {
      if (!matcherPatternRegex.test(matcher.pattern)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid URL Pattern (must be a valid glob-like pattern)',
          path: ['matchers', index, 'pattern'] // Path to the specific pattern string
        });
      }
    } else if (typeof matcher === 'string') { // Also validate strings
      if (!matcherPatternRegex.test(matcher)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid URL Pattern (must be a valid glob-like pattern)',
          path: ['matchers', index] // Path to the specific string matcher
        });
      }
    }
  });
});

export const GroupConfigurationSchemas = z
  .array(GroupConfigurationSchema)
  .refine(groupConfigurations => {
    const groupConfigurationIds = new Set(
      groupConfigurations.map(groupConfiguration => groupConfiguration.id)
    )

    return groupConfigurationIds.size === groupConfigurations.length
  }, 'Duplicate group configuration IDs are not allowed')
