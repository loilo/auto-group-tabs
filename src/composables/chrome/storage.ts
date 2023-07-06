import { tickResetRef, toRawDeep } from '@/composables'
import { readStorage, watchStorage, writeStorage } from '@/util/storage'
import { watchThrottled } from '@vueuse/core'
import { ref, Ref, watch } from 'vue'
import { ignoreChromeRuntimeEvents } from './util'

const storageHandles = {
  sync: new Map(),
  local: new Map(),
  managed: new Map(),
  session: new Map()
}

export type UseStorageOptions<T> = Partial<{
  storage: chrome.storage.AreaName
  throttle: number
  loadMapper?: (value: any) => T
  saveMapper?: (value: T) => any
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
  {
    storage = 'sync',
    throttle = 0,
    loadMapper,
    saveMapper
  }: UseStorageOptions<T> = {}
): {
  loaded: Ref<boolean>
  data: Ref<T>
} {
  const storageHandle = storageHandles[storage]

  if (!storageHandle.has(key)) {
    const loaded = ref(false)
    const data = ref(fallback)
    const changedFromStorage = tickResetRef(false)

    readStorage(key, storage).then(value => {
      loaded.value = true

      if (typeof loadMapper === 'function') {
        value = loadMapper(value)
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

          if (typeof loadMapper === 'function') {
            newValue = loadMapper(newValue)
          }

          data.value = newValue
        },
        storage
      )
    })

    const watcher = <U>(newValue: U) => {
      if (changedFromStorage.value) return
      newValue = toRawDeep(newValue)

      if (typeof saveMapper === 'function') {
        newValue = saveMapper(newValue as unknown as T)
      }

      writeStorage(key, newValue, storage)
    }

    if (throttle > 0) {
      watchThrottled(data, watcher as any, { deep: true, throttle })
    } else {
      watch(data, watcher, { deep: true })
    }

    storageHandle.set(key, { loaded, data })
  }

  return storageHandle.get(key)
}
