import { useReadonlyChromeWindows } from '@/composables'
import { watch } from 'vue'
import { Queue, queueUntilResolve } from './queue-until-resolve'
import { GroupConfiguration } from './types'

/**
 * The group creation tracker keeps track of groups in the (asynchronous) making
 * This is needed when assigning multiple tabs to the same group in quick succession
 * because otherwise multiple groups of the same name/color would be created
 */
export class GroupCreationTracker {
  #groupsInTheMaking = new Map<number, Map<string, Queue<number>>>()

  constructor() {
    const chromeWindows = useReadonlyChromeWindows()

    // Clean up maps with destroyed windows
    watch(chromeWindows.lastRemoved, removedWindowId => {
      this.#groupsInTheMaking.delete(removedWindowId!)
    })
  }

  #getOrCreateWindowMap(windowId: number) {
    if (!this.#groupsInTheMaking.has(windowId)) {
      this.#groupsInTheMaking.set(windowId, new Map())
    }

    return this.#groupsInTheMaking.get(windowId)
  }

  isCreating(windowId: number, group: GroupConfiguration) {
    return this.#groupsInTheMaking.get(windowId)?.has(group.id) ?? false
  }

  getCreationPromise(windowId: number, group: GroupConfiguration) {
    if (this.isCreating(windowId, group)) {
      return this.#groupsInTheMaking.get(windowId)!.get(group.id)!.promise
    }

    throw new Error(
      'Cannot get group creation Promise for a group that is not currently being created.'
    )
  }

  queueGroupCreation(
    windowId: number,
    group: GroupConfiguration,
    creationPromise: Promise<number>
  ) {
    if (this.isCreating(windowId, group)) {
      this.#groupsInTheMaking
        .get(windowId)!
        .get(group.id)!
        .push(creationPromise)
    } else {
      const map = this.#getOrCreateWindowMap(windowId)!
      const queue = queueUntilResolve(creationPromise)
      map.set(group.id, queue)

      queue.promise.then(() => {
        map.delete(group.id)
      })
    }
  }
}
