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

/**
 * Create a predicate function for a given group configuration which matches
 * another group configuration if it has the same title and color
 */
export function createGroupConfigurationMatcher(
  group: Partial<Pick<GroupConfiguration, 'title' | 'color'>>
) {
  return (tabGroup: Partial<Pick<GroupConfiguration, 'title' | 'color'>>) =>
    tabGroup.title === group.title && tabGroup.color === group.color
}
