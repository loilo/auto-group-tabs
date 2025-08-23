import { nextTick, ref, Ref, UnwrapRef, watch } from 'vue'

/**
 * Create a copy of a ref/computed callback that is updated whenever the ref changes but does not populate
 * changes back to the original ref. Instead, a callback will be called if the copy is
 * changed locally (i.e. not through a sync of the original ref), potentially to sync changes back
 *
 * This is essentially a computed ref with getter/setter but with an optimistic getter value.
 */
export function useSyncedCopy<T>(
  original: Ref<T> | (() => T),
  localChangeCallback?: (value: T) => void,
) {
  const get = (): T =>
    JSON.parse(
      JSON.stringify(
        typeof original === 'function' ? original() : original.value,
      ),
    )
  const syncedCopy = ref(get())
  const externalChange = ref(false)

  watch(
    original,
    () => {
      externalChange.value = true
      syncedCopy.value = get() as UnwrapRef<T>

      nextTick(() => {
        externalChange.value = false
      })
    },
    { deep: true },
  )

  watch(
    syncedCopy,
    copyValue => {
      if (!externalChange.value) {
        localChangeCallback?.(copyValue as T)
      }
    },
    { deep: true },
  )

  return syncedCopy
}
