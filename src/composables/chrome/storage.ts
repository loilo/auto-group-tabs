import { tickResetRef, toRawDeep } from '@/composables'
import { readStorage, watchStorage, writeStorage } from '@/util/storage'
import { throttledWatch } from '@vueuse/core'
import { ref, Ref, watch } from 'vue'
import { ignoreChromeRuntimeEvents } from './util'

let storageHandles = { sync: new Map(), local: new Map(), managed: new Map() }

export type UseStorageOptions<T> = Partial<{
  storage: chrome.storage.AreaName
  throttle: number
  mapper?: (value: any) => T
}>

/**
 * Reactive storage handling
 *
 * @param {string} key
 * @param {object} options
 * @returns {object}
 */
export function useStorage<T = any>(
  key: string,
  fallback: T,
  { storage = 'sync', throttle = 0, mapper }: UseStorageOptions<T> = {}
): {
  loaded: Ref<boolean>
  data: Ref<T>
} {
  let storageHandle = storageHandles[storage]

  if (!storageHandle.has(key)) {
    const loaded = ref(false)
    const data = ref(fallback)
    const changedFromStorage = tickResetRef(false)

    readStorage(key, storage).then(value => {
      loaded.value = true

      if (typeof mapper === 'function') {
        value = mapper(value)
      }

      if (typeof value !== 'undefined') {
        changedFromStorage.value = true
        data.value = value
      }

      watchStorage(
        key,
        newValue => {
          if (ignoreChromeRuntimeEvents.value) {
            return
          }

          changedFromStorage.value = true

          if (typeof mapper === 'function') {
            newValue = mapper(newValue)
          }

          data.value = newValue
        },
        storage
      )
    })

    let watcher = <U>(newValue: U) => {
      if (changedFromStorage.value) return
      writeStorage(key, toRawDeep(newValue), storage)
    }

    if (throttle > 0) {
      throttledWatch(data, watcher as any, { deep: true, throttle })
    } else {
      watch(data, watcher, { deep: true })
    }

    storageHandle.set(key, { loaded, data })
  }

  return storageHandle.get(key)
}
