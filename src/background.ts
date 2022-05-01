import { useRefHistory } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import {
  TabUpdate,
  tickResetRef,
  useGroupConfigurations,
  ignoreChromeRuntimeEvents,
  useChromeState
} from '@/composables'
import * as conflictManager from '@/util/conflict-manager'
import {
  saveGroupConfigurations,
  createGroupConfigurationMatcher
} from '@/util/group-configurations'
import { GroupCreationTracker } from '@/util/group-creation-tracker'
import { generateMatcherRegex } from '@/util/matcher-regex'
import { GroupConfiguration } from '@/util/types'
import { when } from '@/util/when'

ignoreChromeRuntimeEvents.value = true

const groupConfigurations = useGroupConfigurations()

const chromeState = useChromeState()

// Augmented group configurations are group configurations with
// enhanced functionality, e.g. matchers converted to regular expressions
const augmentedGroupConfigurations = computed(() =>
  groupConfigurations.data.value.map(group => ({
    ...group,
    matchers: group.matchers.flatMap(matcher => {
      try {
        return generateMatcherRegex(matcher)
      } catch {
        return []
      }
    })
  }))
)

const chromeTabsByGroupConfiguration = computed(() => {
  const tabsByGroups = new Map<GroupConfiguration, chrome.tabs.Tab[]>()
  const tabs = chromeState.tabs.items.value

  for (const tab of tabs) {
    const group = getGroupConfigurationForTab(tab)
    if (!group) continue

    if (tabsByGroups.has(group)) {
      tabsByGroups.get(group)!.push(tab)
    } else {
      const groupTabs = [tab]
      tabsByGroups.set(group, groupTabs)
    }
  }

  return tabsByGroups
})

/**
 * { [string: windowId]: Map<GroupConfiguration, chrome.tabs.Tab[]> }
 */
const chromeTabsByWindowIdAndGroupConfiguration = computed(() =>
  Object.entries(chromeState.tabsByWindowId.value).map(
    ([windowId, tabs]: [string, chrome.tabs.Tab[]]) => {
      const tabsByGroups = new Map<GroupConfiguration, chrome.tabs.Tab[]>()

      for (const tab of tabs) {
        const group = getGroupConfigurationForTab(tab)
        if (!group) continue

        if (tabsByGroups.has(group)) {
          tabsByGroups.get(group)!.push(tab)
        } else {
          const groupTabs = [tab]
          tabsByGroups.set(group, groupTabs)
        }
      }

      return { windowId: Number(windowId), tabsByGroups }
    }
  )
)

Object.assign(self, { chromeState })

/**
 * Get a matching configuration group for a tab
 */
function getGroupConfigurationForTab(tab: chrome.tabs.Tab) {
  // Ignore pinned tabs
  if (tab.pinned) {
    console.debug('Tab %o (%o) pinned, ignore.', tab.title, tab.id)
    return
  }

  // Ignore tabs with no URL
  if (!tab.url) {
    console.debug('Tab %o (%o) has no URL, ignore.', tab.title, tab.id)
    return
  }

  // Iterate tab group configurations
  let groupIndex = 0
  for (const group of augmentedGroupConfigurations.value) {
    for (const matcher of group.matchers) {
      if (matcher.test(tab.url))
        return groupConfigurations.data.value[groupIndex]
    }
    groupIndex++
  }

  // No matching group found
  return
}

const groupCreationTracker = new GroupCreationTracker()

async function assignTabsToGroup(
  tabs: chrome.tabs.Tab[],
  group: GroupConfiguration
) {
  if (tabs.length === 0) return

  const windowId = tabs[0].windowId

  const tabGroupPredicate = createGroupConfigurationMatcher(group)

  // Get existing tab groups that match the configured group
  let tabGroup =
    chromeState.tabGroupsByWindowId.value[windowId]?.find(tabGroupPredicate)
  let tabGroupId = tabGroup?.id

  console.debug(
    'Assigning %o tabs to group %o (%o / %o)...',
    tabs.length,
    tabGroupId,
    group.title,
    group.color
  )

  // Assign the tabs to the proper tab group
  // If the group does not exist, it is created in the process
  const attemptGroupAssignment = async ({ waitable = true } = {}) => {
    const tabIds = tabs.flatMap(tab => tab.id ?? [])

    // We need to query the current tab state because they
    // may have been dragged to a different window
    const windowId = (await chrome.tabs.get(tabs[0].id!)).windowId

    let tabGroupId =
      chromeState.tabGroupsByWindowId.value[windowId]?.find(
        tabGroupPredicate
      )?.id

    try {
      if (waitable && groupCreationTracker.isCreating(windowId, group)) {
        tabGroupId = await groupCreationTracker.getCreationPromise(
          windowId,
          group
        )
      }

      if (!tabGroupId) {
        console.debug('Attempt assignment to new group in window %o', windowId)
        const tabCreationPromise = chrome.tabs.group({
          tabIds,
          createProperties: { windowId }
        })

        groupCreationTracker.queueGroupCreation(
          windowId,
          group,
          tabCreationPromise
        )

        const newGroupId = await tabCreationPromise

        await chrome.tabGroups.update(newGroupId, {
          title: group.title,
          color: group.color
        })
      } else {
        console.debug('Attempt assignment to existing group %o', tabGroupId)
        await chrome.tabs.group({
          tabIds,
          groupId: tabGroupId
        })
      }

      tabIds.forEach(tabId => draggingTabs.delete(tabId))
      console.debug('Assignment successful')

      return tabGroupId
    } catch (error) {
      if (
        error ==
        'Error: Tabs cannot be edited right now (user may be dragging a tab).'
      ) {
        // Checking for this error and polling is the officially
        // recommended way to handle dragged tabs, see
        // https://developer.chrome.com/docs/extensions/reference/tabs/#move-the-current-tab-to-the-first-position-when-clicked

        tabIds.forEach(tabId => draggingTabs.add(tabId))

        console.debug(
          'Tab is being dragged, cannot assign it to a group, poll for dragging to be done...'
        )
        setTimeout(() => {
          const result = attemptGroupAssignment({ waitable: false })

          groupCreationTracker.queueGroupCreation(
            windowId,
            group,
            result.then(id => {
              if (typeof id === 'number') return id

              // This error should never surface, it's purely a signal for the group creation tracker
              throw new Error('Tab group assignment failed')
            })
          )
        }, 50)
      } else {
        console.error('Could not group tabs:', error)
      }
    }
  }

  await attemptGroupAssignment()
}

async function groupAllAppropriateTabs() {
  for (const {
    tabsByGroups
  } of chromeTabsByWindowIdAndGroupConfiguration.value) {
    for (const [group, tabs] of tabsByGroups) {
      await assignTabsToGroup(tabs, group)
    }
  }
}

const justLoadedGroupConfigurations = tickResetRef(false)
const stopWatchingGroupConfigurationsLoaded = watch(
  groupConfigurations.loaded,
  isLoaded => {
    if (isLoaded) {
      stopWatchingGroupConfigurationsLoaded()
      justLoadedGroupConfigurations.value = true
    }
  }
)

const programmaticallyUpdatingTabGroups = ref(false)

const draggingTabs = new Set<number>()

// React to changed group configurations
watch(
  augmentedGroupConfigurations,
  async (newGroups, oldGroups) => {
    // Bail out if group configurations haven't loaded yet
    if (
      !groupConfigurations.loaded.value ||
      justLoadedGroupConfigurations.value
    )
      return

    const addedGroupConfigurations = newGroups.filter(
      ({ id }) => !oldGroups!.some(oldGroup => oldGroup.id === id)
    )

    const deletedGroupConfigurations = oldGroups!.filter(
      ({ id }) => !newGroups.some(newGroup => newGroup.id === id)
    )

    // Superficially changed = just title and/or color changed
    const superficiallyChangedGroupConfigurations = newGroups.filter(
      newGroup => {
        const oldGroup = oldGroups!.find(
          oldGroup => oldGroup.id === newGroup.id
        )
        if (!oldGroup) return false

        return (
          oldGroup.title !== newGroup.title || oldGroup.color !== newGroup.color
        )
      }
    )

    const deeplyChangedGroupConfigurations = newGroups.filter(newGroup => {
      const oldGroup = oldGroups!.find(oldGroup => oldGroup.id === newGroup.id)

      // Group is new -> it's not counting as changed
      if (!oldGroup) return false

      // Group is at a different position than before
      if (oldGroups!.indexOf(oldGroup) !== newGroups.indexOf(newGroup))
        return true

      // Group has different matchers than before
      if (oldGroup.matchers.length !== newGroup.matchers.length) return true
      const sortedOldMatchers = [...oldGroup.matchers].sort()
      const sortedNewMatchers = [...newGroup.matchers].sort()

      for (let i = 0; i < oldGroup.matchers.length; i++) {
        if (sortedOldMatchers[i].source !== sortedNewMatchers[i].source)
          return true
      }

      return false
    })

    if (addedGroupConfigurations.length > 0) {
      console.debug('Added tab group configurations:', addedGroupConfigurations)
    }

    if (superficiallyChangedGroupConfigurations.length > 0) {
      console.debug(
        'Superficially changed tab group configurations:',
        superficiallyChangedGroupConfigurations
      )

      // Update superficially changed groups
      for (const newGroup of newGroups) {
        if (!superficiallyChangedGroupConfigurations.includes(newGroup))
          continue

        const oldGroup = oldGroups!.find(
          oldGroup => oldGroup.id === newGroup.id
        )!

        programmaticallyUpdatingTabGroups.value = true
        for (const tabGroup of chromeState.tabGroups.items.value) {
          if (
            tabGroup.title === oldGroup.title &&
            tabGroup.color === oldGroup.color
          ) {
            // Wait until updated
            await chrome.tabGroups.update(tabGroup.id, {
              title: newGroup.title,
              color: newGroup.color
            })

            // Wait until reflected in state
            await when(chromeState.tabGroups.items, tabGroups =>
              tabGroups.some(
                stateTabGroup =>
                  stateTabGroup.id === tabGroup.id &&
                  stateTabGroup.title === newGroup.title &&
                  stateTabGroup.color === newGroup.color
              )
            )
          }
        }
        programmaticallyUpdatingTabGroups.value = false
      }
    }

    if (deeplyChangedGroupConfigurations.length > 0) {
      console.debug(
        'Deeply changed tab group configurations:',
        deeplyChangedGroupConfigurations
      )
    }

    if (deletedGroupConfigurations.length > 0) {
      console.debug(
        'Deleted tab group configurations:',
        deletedGroupConfigurations
      )
      let groupsToDelete = chromeState.tabGroups.items.value.filter(tabGroup =>
        deletedGroupConfigurations.some(
          groupConfiguration =>
            groupConfiguration.title === tabGroup.title &&
            groupConfiguration.color === tabGroup.color
        )
      )

      console.debug('Tab groups to delete: %o', groupsToDelete)

      for (let groupToDelete of groupsToDelete) {
        let tabsToUngroup = chromeState.tabs.items.value.filter(
          tab => tab.groupId === groupToDelete.id
        )

        chrome.tabs.ungroup(tabsToUngroup.flatMap(tab => tab.id ?? []))
      }
    }

    if (
      addedGroupConfigurations.length > 0 ||
      deeplyChangedGroupConfigurations.length > 0
    ) {
      console.debug('❇️ Added groups or changed matchers, reassign tabs.')
      await groupAllAppropriateTabs()
    }
  },
  { immediate: true }
)

const tabGroupsHistory = useRefHistory(chromeState.tabGroups.items, {
  capacity: 2
})
const removedTabGroups = useRefHistory(chromeState.tabGroups.lastRemoved, {
  capacity: 10
})

// When manually updating a group name/color, sync that back to the configuration
watch(chromeState.tabGroups.lastUpdated, async tabGroup => {
  if (!tabGroup) return
  if (programmaticallyUpdatingTabGroups.value) return

  const oldTabGroup = tabGroupsHistory.history.value[0].snapshot.find(
    stateTabGroup => stateTabGroup.id === tabGroup!.id
  )
  if (!oldTabGroup) return
  if (
    oldTabGroup.title === tabGroup.title &&
    oldTabGroup.color === tabGroup.color
  )
    return

  const matchesOldGroup = createGroupConfigurationMatcher(oldTabGroup)
  const matchesNewGroup = createGroupConfigurationMatcher(tabGroup)

  if (groupConfigurations.data.value.some(matchesOldGroup)) {
    const groupsCopy: GroupConfiguration[] = JSON.parse(
      JSON.stringify(groupConfigurations.data.value)
    )

    const conflictingItem = groupsCopy.find(matchesNewGroup)
    let unconflictingTitle: string

    // Check for and resolve conflicts
    if (conflictingItem) {
      // We cannot prevent the user from changing the group name/color manually,
      // therefore, in case of a conflict, we need to resolve it by renaming the
      // existing group it conflicts with.
      unconflictingTitle = conflictManager.withMarker(tabGroup.title!)
      conflictingItem.title = unconflictingTitle
    }

    const updatedGroupItem = groupsCopy.find(matchesOldGroup)!
    updatedGroupItem.title = tabGroup.title ?? ''
    updatedGroupItem.color = tabGroup.color

    saveGroupConfigurations(groupsCopy)

    if (conflictingItem) {
      // When there was a conflict, and the conflicting group has been renamed,
      // our manually edited tab will now belong to that conflicting group as it was
      // briefly shifted there when its group names matched and then renamed to the
      // unconflicting group name in the background.
      // However, since the actual tab name now no longer matches the name in Chrome's
      // tab group editor input field, we need to revert the tab group's name to match
      // that input field again.

      programmaticallyUpdatingTabGroups.value = true

      // Wait for the manually edited tab group to have its
      // title aligned with the unconflicting title
      await when(
        chromeState.tabGroups.lastUpdated,
        updatedTabGroup =>
          updatedTabGroup!.id === tabGroup.id &&
          updatedTabGroup!.title === unconflictingTitle
      )

      // Revert the edited tab group's title
      await chrome.tabGroups.update(tabGroup.id, {
        title: tabGroup.title
      })

      // Wait for the reverted title to be reflected in the extension state
      await when(
        chromeState.tabGroups.lastUpdated,
        updatedTabGroup =>
          updatedTabGroup!.id === tabGroup.id &&
          updatedTabGroup!.title === tabGroup.title
      )
      programmaticallyUpdatingTabGroups.value = false
    }
  }
})

// Reload the runtime on update to avoid sticking to outdated behavior in existing tabs
chrome.runtime.onUpdateAvailable.addListener(() => {
  chrome.runtime.reload()
})

when(groupConfigurations.loaded).then(async () => {
  // Wait for the extension state to initialize
  console.debug('Waiting for extension state to initialize...')
  await when(chromeState.tabs.loaded)

  console.debug(
    'Extension state initialized, grouping all appropriate tabs now...'
  )
  await groupAllAppropriateTabs()

  console.debug(
    'Initial grouping done, begin listening to chrome runtime events...'
  )
  ignoreChromeRuntimeEvents.value = false

  watch(chromeState.tabs.lastUpdated, async (update: TabUpdate | undefined) => {
    if (!update) return
    if (chromeState.tabs.detachedTabs.value.includes(update.tab.id!)) return
    if (draggingTabs.has(update.tab.id!)) return

    const removedFromTabGroup =
      update.changes.groupId === chrome.tabGroups.TAB_GROUP_ID_NONE
    if (!update.changes.url && !removedFromTabGroup) return

    if (removedFromTabGroup) {
      console.debug(
        'Removed tab %o (%o) from tab group %o. Looking up the group now...',
        update.tab.title,
        update.tab.id,
        update.oldTab?.groupId
      )

      try {
        await chrome.tabGroups.get(update.oldTab!.groupId)
        console.debug('Group found, it still exists.')
      } catch {
        console.debug(
          'Group of removed tab no longer found. Waiting for extension state to reflect the removal...'
        )

        await when(removedTabGroups.history, history =>
          history.some(item => item.snapshot?.id === update.oldTab!.groupId)
        )

        console.debug('Reflected tab group removal in extension state')
      }
    }

    // Check if the tab itself is gone
    if (!chromeState.tabsById.value[update.tab.id!]) return

    console.debug(
      'Reassigning tab %o (%o) due to change %o',
      update.tab.title,
      update.tab.id,
      update.changes
    )

    // Fetch current data for tab instead of reusing update.tab
    // as this leads to problems in cases where the user closed a window
    // by moving a tab.
    let updatedTab = await chrome.tabs.get(update.tab.id!)

    for (const [group, tabs] of chromeTabsByGroupConfiguration.value) {
      if (!tabs.some(tab => tab.id === updatedTab.id)) continue

      await assignTabsToGroup([updatedTab], group)
    }
  })
})

chrome.action.onClicked.addListener(() => {
  console.debug('Trigger extension action')
  chrome.runtime.openOptionsPage()
})
