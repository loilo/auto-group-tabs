import { readonly, ref } from 'vue'

function _useReadonlyChromeWindows() {
  const windows = ref<chrome.windows.Window[]>([])
  const loaded = ref(false)
  const lastCreated = ref<chrome.windows.Window | undefined>(undefined)
  const lastRemoved = ref<number | undefined>(undefined)

  if (typeof chrome.windows !== 'undefined') {
    chrome.windows
      .getAll()
      .then(queriedWindows => {
        windows.value = queriedWindows.filter(
          window => window.type === 'normal',
        )
        loaded.value = true

        chrome.windows.onCreated.addListener(createdWindow => {
          if (createdWindow.type !== 'normal') return

          lastCreated.value = createdWindow
          windows.value = [...windows.value, createdWindow]
        })

        chrome.windows.onRemoved.addListener(removedWindowId => {
          lastRemoved.value = removedWindowId
          windows.value = windows.value.filter(
            window => window.id !== removedWindowId,
          )
        })
      })
      .catch(error => {
        console.error('Error getting chrome windows:', error)
      })
  } else {
    loaded.value = true
  }

  return {
    items: readonly(windows),
    loaded: readonly(loaded),
    lastCreated: readonly(lastCreated),
    lastRemoved: readonly(lastRemoved),
  }
}

let readonlyChromeWindows: ReturnType<typeof _useReadonlyChromeWindows>
export function useReadonlyChromeWindows() {
  if (!readonlyChromeWindows) {
    readonlyChromeWindows = _useReadonlyChromeWindows()
  }
  return readonlyChromeWindows
}
