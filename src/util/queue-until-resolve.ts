import monomitter from 'monomitter'

export type Queue<T> = {
  promise: Promise<T>
  push: (newPromise: Promise<T>) => void
}

/**
 * A queue that sequentially checks on a list of Promises sequentially,
 * resolving when the first Promise of the list resolves, and with the ability
 * to asynchronously add new Promises to the list.
 *
 * Note that the queue *never* rejects. If no resolved Promise is in the list,
 * the queue will wait for a new Promise to be added and continue evaluating.
 */
export function queueUntilResolve<T>(
  initialPromise: Promise<T> = Promise.reject(),
) {
  const list = [initialPromise]
  const [publishNewPromise, subscribeNewPromise] = monomitter()

  function push(newPromise: Promise<T>) {
    list.push(newPromise)
    publishNewPromise()
  }

  function resolveList(): Promise<T> {
    const firstItem = list.shift()!

    return firstItem
      .catch(() => {
        if (list.length === 0) {
          // If no list items remain, wait for a new Promise to be attached
          return new Promise<T>(resolve => {
            const unsubscribe = subscribeNewPromise(() => {
              unsubscribe()
              resolve(resolveList())
            })
          })
        } else {
          return resolveList()
        }
      })
      .then(result => {
        if (list.length === 0) return result
        return resolveList()
      })
  }
  return { push, promise: resolveList() }
}
