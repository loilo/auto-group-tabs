import { toRawDeep } from '@/composables'
import * as conflictManager from './conflict-manager'
import { writeStorage } from './storage'
import { GroupConfiguration } from './types'

/**
 * Save configured groups to storage
 */
export async function saveGroupConfigurations(groups: GroupConfiguration[]) {
  return saveConfigurations(JSON.parse(JSON.stringify(toRawDeep(groups)))
  )
}

export async function saveGroupJSONConfigurations(groups: string) {
  return saveConfigurations(JSON.parse(groups))
}

export async function saveConfigurations(groups: GroupConfiguration[]) {

  for (const group of groups) {
    // If there are no more conflicts, get rid of the conflict marker

    if (!conflictManager.hasMarker(group.title)) continue

    const titleWithoutConflictMarker = conflictManager.withoutMarker(
      group.title
    )

    if (groups.some(group => group.title === titleWithoutConflictMarker))
      continue

    group.title = titleWithoutConflictMarker
  }

  return await writeStorage('groups', groups, 'sync')
}


