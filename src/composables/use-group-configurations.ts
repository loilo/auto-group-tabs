import { useStorage } from './chrome'
import { GroupConfiguration } from '@/util/types'

/**
 * Get configured groups from storage
 */
export function useGroupConfigurations() {
  return useStorage<GroupConfiguration[]>('groups', [], {
    mapper(value) {
      // In very early extension versions, groups were serialied before storing
      if (typeof value === 'string') {
        value = JSON.parse(value)
      }

      if (!Array.isArray(value)) return []

      // Group options have been added in v0.0.12, add them if missing
      for (let group of value) {
        if (!('options' in group)) {
          group.options = { strict: false }
        }
      }

      return value
    }
  })
}
