import { computed } from 'vue'
import {
  useChromeTabGroupsByWindowId,
  useReadonlyChromeTabGroups,
} from './tab-groups'
import {
  useChromeTabsById,
  useChromeTabsByWindowId,
  useReadonlyChromeTabs,
} from './tabs'
import { useReadonlyChromeWindows } from './windows'

export function useChromeState() {
  const windows = useReadonlyChromeWindows()
  const tabs = useReadonlyChromeTabs()
  const tabGroups = useReadonlyChromeTabGroups()
  const loaded = computed(
    () => windows.loaded.value && tabs.loaded.value && tabGroups.loaded.value,
  )

  return {
    loaded,
    windows,
    tabs,
    tabGroups,
    tabsById: useChromeTabsById(),
    tabsByWindowId: useChromeTabsByWindowId(),
    tabGroupsByWindowId: useChromeTabGroupsByWindowId(),
  }
}
