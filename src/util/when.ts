import { nextTick, Ref, watch } from 'vue'

// By default, check if the value is truthy
const defaultPredicate = <T>(value: T) => Boolean(value)

/**
 * Create a promise that resolves when a ref fullfills a predicate.
 * With no predicate provided, the ref will be checked for truthiness.
 */
export function when<T>(
  container: Ref<T>,
  predicate: (value: T) => boolean = defaultPredicate
) {
  return new Promise<void>(resolve => {
    const stop = watch(
      container,
      value => {
        if (predicate(value)) {
          nextTick(() => {
            stop()
          })

          resolve()
        }
      },
      { deep: true, immediate: true }
    )
  })
}
