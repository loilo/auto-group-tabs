import { whenever } from '@vueuse/core'
import { computed, readonly, ref } from 'vue'
import { ignoreChromeRuntimeEvents } from './util'
import { useReadonlyChromeWindows } from './windows'

function _useReadonlyChromeTabGroups() {
  const tabGroups = ref<chrome.tabGroups.TabGroup[]>([])
  const loaded = ref(false)
  const lastCreated = ref<chrome.tabGroups.TabGroup | undefined>(undefined)
  const lastUpdated = ref<chrome.tabGroups.TabGroup | undefined>(undefined)
  const lastRemoved = ref<chrome.tabGroups.TabGroup | undefined>(undefined)

  const chromeWindows = useReadonlyChromeWindows()

  whenever(chromeWindows.loaded, async () => {
    let queriedTabGroups = await Promise.all(
      chromeWindows.items.value.map(window =>
        chrome.tabGroups.query({ windowId: window.id })
      )
    )

    tabGroups.value = queriedTabGroups.flat()
    loaded.value = true

    chrome.tabGroups.onCreated.addListener(createdTabGroup => {
      if (ignoreChromeRuntimeEvents.value) {
        return
      }

      lastCreated.value = createdTabGroup
      tabGroups.value = [...tabGroups.value, createdTabGroup]
    })

    chrome.tabGroups.onRemoved.addListener(removedTabGroup => {
      if (ignoreChromeRuntimeEvents.value) {
        return
      }

      lastRemoved.value = removedTabGroup
      tabGroups.value = tabGroups.value.filter(
        Tab => Tab.id !== removedTabGroup.id
      )
    })

    chrome.tabGroups.onUpdated.addListener(updatedTabGroup => {
      if (ignoreChromeRuntimeEvents.value) {
        return
      }

      lastUpdated.value = updatedTabGroup
      const index = tabGroups.value.findIndex(
        tabGroup => tabGroup.id === updatedTabGroup.id
      )
      tabGroups.value = [
        ...tabGroups.value.slice(0, index),
        updatedTabGroup,
        ...tabGroups.value.slice(index + 1)
      ]
    })
  })

  return {
    items: readonly(tabGroups),
    loaded: readonly(loaded),
    lastCreated: readonly(lastCreated),
    lastUpdated: readonly(lastUpdated),
    lastRemoved: readonly(lastRemoved)
  }
}

let readonlyChromeTabGroups: ReturnType<typeof _useReadonlyChromeTabGroups>
export function useReadonlyChromeTabGroups() {
  if (!readonlyChromeTabGroups) {
    readonlyChromeTabGroups = _useReadonlyChromeTabGroups()
  }
  return readonlyChromeTabGroups
}

export function useChromeTabGroupsByWindowId() {
  const chromeWindows = useReadonlyChromeWindows()
  const chromeTabGroups = useReadonlyChromeTabGroups()

  return computed<{
    [windowId: string]: chrome.tabGroups.TabGroup[]
  }>(() =>
    Object.fromEntries(
      chromeWindows.items.value.map(window => [
        window.id,
        chromeTabGroups.items.value.filter(
          tabGroup => tabGroup.windowId === window.id
        )
      ])
    )
  )
}
