import { computed } from 'vue'
import { useStorage } from './chrome'
import { GroupConfiguration } from '@/util/types'

/**
 * Get configured groups from storage
 */
export function useGroupConfigurations() {
  return useStorage<GroupConfiguration[]>('groups', [], {
    mapper: value => (typeof value === 'string' ? JSON.parse(value) : value)
  })
}
