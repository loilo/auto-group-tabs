import { toRawDeep } from '@/composables'
import * as conflictManager from './conflict-manager'
import { writeStorage } from './storage'
import { GroupConfiguration } from './types'

/**
 * Save configured groups to storage
 */
export async function saveGroupConfigurations(groups: GroupConfiguration[]) {
  const groupsCopy: GroupConfiguration[] = JSON.parse(
    JSON.stringify(toRawDeep(groups))
  )

  for (const group of groupsCopy) {
    // If there are no more conflicts, get rid of the conflict marker

    if (!conflictManager.hasMarker(group.title)) continue

    const titleWithoutConflictMarker = conflictManager.withoutMarker(
      group.title
    )

    if (groupsCopy.some(group => group.title === titleWithoutConflictMarker))
      continue

    group.title = titleWithoutConflictMarker
  }

  return await writeStorage('groups', groupsCopy, 'sync')
}
