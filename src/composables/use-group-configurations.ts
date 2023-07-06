import { useStorage } from './chrome'
import { GroupConfiguration } from '@/util/types'
import * as lzma from '@/util/lzma'

/**
 * Get configured groups from storage
 */
export function useGroupConfigurations() {
  return useStorage<GroupConfiguration[]>('groups', [], {
    saveMapper(groups) {
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
      for (const group of storedGroups) {
        if (!('options' in group)) {
          group.options = { strict: false, merge: false }
        }

        if (!('merge' in group.options)) {
          group.options.merge = false
        }
      }

      return storedGroups
    }
  })
}
