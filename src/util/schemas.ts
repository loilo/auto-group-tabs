import { z } from 'zod'
import { matcherPattern } from './helpers'
import { colors } from './resources'

export const SaveOptionsSchema = z.object({
  strict: z.boolean().default(false),
  merge: z.boolean().default(false),
})

const matcherPatternRegex = new RegExp(matcherPattern)

export const GroupConfigurationSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  color: z.enum(colors),
  options: SaveOptionsSchema,
  matchers: z
    .array(
      z
        .string()
        .refine(
          pattern => matcherPatternRegex.test(pattern),
          'Invalid URL Pattern',
        ),
    )
    .refine(
      matchers => new Set(matchers).size === matchers.length,
      'Duplicate URL Patterns are not allowed',
    ),
})

export const GroupConfigurationSchemas = z
  .array(GroupConfigurationSchema)
  .refine(groupConfigurations => {
    const groupConfigurationIds = new Set(
      groupConfigurations.map(groupConfiguration => groupConfiguration.id),
    )

    return groupConfigurationIds.size === groupConfigurations.length
  }, 'Duplicate group configuration IDs are not allowed')
