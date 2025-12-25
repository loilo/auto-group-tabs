import { whenever } from '@vueuse/core'
import { computed, readonly, ref, toValue } from 'vue'
import { ignoreChromeRuntimeEvents } from './util'
import { useReadonlyChromeWindows } from './windows'

export type TabUpdate = {
  changes: chrome.tabs.OnUpdatedInfo
  tab: chrome.tabs.Tab
  oldTab: chrome.tabs.Tab | undefined
}

export type TabMove = {
  tabs: chrome.tabs.Tab[]
  moveInfo: chrome.tabs.OnMovedInfo
}

function _useReadonlyChromeTabs() {
  const tabs = ref<chrome.tabs.Tab[]>([])
  const detachedTabs = ref<number[]>([])
  const loaded = ref(false)
  const lastCreated = ref<chrome.tabs.Tab | undefined>(undefined)
  const lastUpdated = ref<TabUpdate | undefined>(undefined)
  const lastRemoved = ref<number | undefined>(undefined)
  const lastMoved = ref<TabMove | undefined>(undefined)

  if (typeof chrome.tabs !== 'undefined') {
    const chromeWindows = useReadonlyChromeWindows()

    whenever(chromeWindows.loaded, async () => {
      const queriedTabs = await Promise.all(
        chromeWindows.items.value.map(window =>
          chrome.tabs.query({ windowId: window.id }),
        ),
      )

      tabs.value = queriedTabs.flat()
      loaded.value = true

      chrome.tabs.onCreated.addListener(createdTab => {
        if (ignoreChromeRuntimeEvents.value) {
          return
        }

        lastCreated.value = createdTab
        tabs.value = [...tabs.value, createdTab]
      })

      chrome.tabs.onRemoved.addListener(removedTabId => {
        if (ignoreChromeRuntimeEvents.value) {
          return
        }

        lastRemoved.value = removedTabId
        tabs.value = tabs.value.filter(tab => tab.id !== removedTabId)
      })

      chrome.tabs.onDetached.addListener(removedTabId => {
        if (ignoreChromeRuntimeEvents.value) {
          return
        }

        detachedTabs.value = [...detachedTabs.value, removedTabId]
      })

      chrome.tabs.onAttached.addListener(async attachedTabId => {
        if (ignoreChromeRuntimeEvents.value) {
          return
        }

        detachedTabs.value = detachedTabs.value.filter(
          tabId => tabId !== attachedTabId,
        )
      })

      chrome.tabs.onUpdated.addListener((tabId, changeInfo, updatedTab) => {
        if (ignoreChromeRuntimeEvents.value) {
          return
        }

        lastUpdated.value = {
          changes: changeInfo,
          tab: updatedTab,
          oldTab: tabs.value.find(tab => tab.id === tabId),
        }

        const index = tabs.value.findIndex(tab => tab.id === updatedTab.id)
        tabs.value = [
          ...tabs.value.slice(0, index),
          updatedTab,
          ...tabs.value.slice(index + 1),
        ]
      })

      chrome.tabs.onMoved.addListener(async (movedTabId, moveInfo) => {
        if (ignoreChromeRuntimeEvents.value) {
          return
        }

        const [lowerIndex, upperIndex] = [
          moveInfo.fromIndex,
          moveInfo.toIndex,
        ].sort((a, b) => a - b)
        const affectedTabIndexes = tabs.value.flatMap((tab, index) => {
          if (tab.windowId !== moveInfo.windowId) return []
          if (tab.index < lowerIndex) return []
          if (tab.index > upperIndex) return []
          return [index]
        })

        const affectedTabs = affectedTabIndexes.map(index => tabs.value[index])

        const tabsCopy = [...tabs.value]
        for (const index of affectedTabIndexes) {
          const tab = tabs.value[index]
          if (tab.id === movedTabId) {
            tabsCopy[index] = { ...tab, index: moveInfo.toIndex }
          } else {
            if (moveInfo.fromIndex < moveInfo.toIndex) {
              tabsCopy[index] = { ...tab, index: tab.index - 1 }
            } else {
              tabsCopy[index] = { ...tab, index: tab.index + 1 }
            }
          }
        }

        tabs.value = tabsCopy

        lastMoved.value = {
          tabs: affectedTabs,
          moveInfo: moveInfo,
        }
      })
    })
  } else {
    loaded.value = true
  }

  return {
    items: readonly(tabs),
    detachedTabs: readonly(detachedTabs),
    loaded: readonly(loaded),
    lastCreated: readonly(lastCreated),
    lastUpdated: readonly(lastUpdated),
    lastRemoved: readonly(lastRemoved),
    lastMoved: readonly(lastMoved),
  }
}

let readonlyChromeTabs: ReturnType<typeof _useReadonlyChromeTabs>
export function useReadonlyChromeTabs() {
  if (!readonlyChromeTabs) {
    readonlyChromeTabs = _useReadonlyChromeTabs()
  }
  return readonlyChromeTabs
}

export function useChromeTabsById() {
  const chromeTabs = useReadonlyChromeTabs()

  return computed<{
    [tabId: string]: chrome.tabs.Tab
  }>(() => Object.fromEntries(chromeTabs.items.value.map(tab => [tab.id, tab])))
}

export function useChromeTabsByWindowId() {
  const chromeTabs = useReadonlyChromeTabs()
  const chromeWindows = useReadonlyChromeWindows()

  return computed<{
    [windowId: string]: chrome.tabs.Tab[]
  }>(() => {
    // Trigger re-computation on tabs change
    toValue(chromeTabs.items)

    return Object.fromEntries(
      chromeWindows.items.value.map(window => [
        window.id,
        chromeTabs.items.value.filter(tab => tab.windowId === window.id),
      ]),
    )
  })
}
