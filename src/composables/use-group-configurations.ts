import { useStorage } from './chrome'
import { GroupConfiguration } from '@/util/types'
import * as lzma from '@/util/lzma'

/**
 * Get configured groups from storage
 */
export function useGroupConfigurations() {
  return useStorage<GroupConfiguration[]>('groups', [], {
    saveMapper(groups) {
      // In browser environment (dev, testing), don't use compression
      if (typeof chrome.storage === 'undefined') return groups

      // Since 0.0.19, groups are serialized and compressed to avoid storage size limits
      return lzma.compressBase64(JSON.stringify(groups))
    },
    loadMapper(storedGroups) {
      // In very early extension versions, groups were serialized as JSON before storing
      if (typeof storedGroups === 'string' && /^[{[]/.test(storedGroups)) {
        storedGroups = JSON.parse(storedGroups)
      }

      // Since 0.0.19, groups are serialized and compressed to avoid storage size limits
      if (typeof storedGroups === 'string') {
        storedGroups = JSON.parse(lzma.decompressBase64(storedGroups))
      }

      // Before 0.0.19, groups were stored as an array of objects,
      // serialization/deserialization was done by Chrome

      // Skip if value is not an array
      if (!Array.isArray(storedGroups)) return []

      // Group options have been added in v0.0.12, add them if missing
      // Matcher format changed from string[] to MatcherObject[]
      for (const group of storedGroups) {
        if (!('options' in group)) {
          group.options = { strict: false, merge: false }
        }

        if (!('merge' in group.options)) {
          group.options.merge = false
        }

        // Transform string matchers to MatcherObject for backward compatibility
        if (group.matchers && Array.isArray(group.matchers)) {
          // @ts-expect-error group.matchers could be string[] or MatcherObject[]
          group.matchers = group.matchers.map(matcher => {
            if (typeof matcher === 'string') {
              return { pattern: matcher, isRegex: false };
            }
            // If it's already an object, ensure isRegex defaults to false if missing
            // This is handled by MatcherObjectSchema, but being explicit here doesn't hurt
            // and handles cases where an object might be malformed from an even older version.
            return { ...{ isRegex: false }, ...matcher };
          });
        }
      }

      return storedGroups
    }
  })
}
