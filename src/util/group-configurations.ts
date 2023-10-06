import { toRawDeep } from '@/composables'
import * as lzma from '@/util/lzma'
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

  // Since 0.0.19, groups are serialized and compressed to avoid storage size limits
  // There has been an oversight that led to this function being uncompressed,
  // this has been fixed in 0.0.20.
  const compressedGroupsCopy = lzma.compressBase64(JSON.stringify(groupsCopy))

  return await writeStorage('groups', compressedGroupsCopy, 'sync')
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
