/**
 * Promisified storage reading.
 * Uses Chrome storage API if available, falls back to localStorage.
 */
export async function readStorage<T = any>(
  key: string,
  storage: chrome.storage.AreaName
) {
  if (typeof chrome.storage === 'undefined') {
    const result = window.localStorage.getItem(key)
    return result ? JSON.parse(result) : undefined
  } else {
    return (await chrome.storage[storage].get([key]))?.[key]
  }
}

export type WatchStorageCallback<T> = (
  newValue: T,
  oldValue: T | undefined
) => void

/**
 * Watch a storage key for changes.
 * Uses Chrome storage API if available, falls back to localStorage.
 */
export function watchStorage<T = any>(
  key: string,
  callback: WatchStorageCallback<T>,
  storage: chrome.storage.AreaName = 'sync'
) {
  if (typeof chrome.storage === 'undefined') {
    const handler = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) return
      if (event.key !== key) return

      if (event.oldValue === event.newValue) return

      let oldValue = event.oldValue ? JSON.parse(event.oldValue) : undefined
      let newValue = event.newValue ? JSON.parse(event.newValue) : undefined

      callback(newValue, oldValue)
    }

    window.addEventListener('storage', handler)

    return () => window.removeEventListener('storage', handler)
  } else {
    const handler = (
      changes: { [key: string]: any },
      area: chrome.storage.AreaName
    ) => {
      if (area !== storage || !(key in changes)) return
      const { newValue, oldValue } = changes[key]
      if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return
      callback(newValue, oldValue)
    }

    chrome.storage.onChanged.addListener(handler)

    return () => chrome.storage.onChanged.removeListener(handler)
  }
}

/**
 * Promisified storage writing.
 * Uses Chrome storage API if available, falls back to localStorage.
 */
export async function writeStorage<T = any>(
  key: string,
  value: T,
  storage: chrome.storage.AreaName = 'sync'
) {
  return await new Promise<void>(resolve => {
    if (typeof chrome.storage === 'undefined') {
      const oldValue = window.localStorage.getItem(key)
      const newValue = JSON.stringify(value)

      // localStorage fallback for testing outside an extension
      window.localStorage.setItem(key, newValue)

      // Create artifical 'storage' events to get parity with chrome storage events
      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue,
          oldValue,
          storageArea: window.localStorage,
          url: window.location.href
        })
      )
      resolve()
    } else {
      chrome.storage[storage].set({ [key]: value }, () => resolve())
    }
  })
}
