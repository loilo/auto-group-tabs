import { useReadonlyChromeWindows } from './windows'
import {
  useReadonlyChromeTabs,
  useChromeTabsById,
  useChromeTabsByWindowId
} from './tabs'
import {
  useReadonlyChromeTabGroups,
  useChromeTabGroupsByWindowId
} from './tab-groups'

export function useChromeState() {
  return {
    windows: useReadonlyChromeWindows(),
    tabs: useReadonlyChromeTabs(),
    tabGroups: useReadonlyChromeTabGroups(),
    tabsById: useChromeTabsById(),
    tabsByWindowId: useChromeTabsByWindowId(),
    tabGroupsByWindowId: useChromeTabGroupsByWindowId()
  }
}
