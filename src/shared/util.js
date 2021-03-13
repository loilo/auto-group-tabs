/**
 * The raw pattern to match URL matchers
 *
 * @see https://developer.chrome.com/docs/extensions/mv2/match_patterns/
 */
export const matcherPattern =
  '((?<scheme>\\*|https?|file|ftp)://)?(?<host>\\*|\\*\\.[^/*]+|[^/*]+\\.[^/*]+|localhost(:[0-9]+)?)(/(?<path>.*))?'

/**
 * Capitalize a string
 *
 * @param {string} string
 * @returns {string}
 */
export const capitalize = string =>
  string.slice(0, 1).toUpperCase() + string.slice(1)

/**
 * Promisified storage reading
 *
 * @param {string} key
 * @param {'local'|'sync'} storage
 * @returns {Promise<any>}
 */
export async function readStorage(key, storage = 'sync') {
  return await new Promise(resolve => {
    if (typeof chrome.storage === 'undefined') {
      // sessionStorage fallback for testing outside an extension
      const result = window.sessionStorage.getItem(key)
      resolve(result ? JSON.parse(result) : undefined)
    } else {
      chrome.storage[storage].get([key], result => {
        resolve(result[key] ? JSON.parse(result[key]) : undefined)
      })
    }
  })
}

/**
 * Promisified storage writing
 *
 * @param {string} key
 * @param {any} value
 * @param {'local'|'sync'} storage
 * @returns {Promise<any>}
 */
export async function writeStorage(key, value, storage = 'sync') {
  return await new Promise(resolve => {
    if (typeof chrome.storage === 'undefined') {
      // sessionStorage fallback for testing outside an extension
      window.sessionStorage.setItem(key, JSON.stringify(value))
      resolve()
    } else {
      chrome.storage[storage].set({ [key]: JSON.stringify(value) }, () =>
        resolve()
      )
    }
  })
}

/**
 * Load configured groups from storage
 *
 * @returns {object[]}
 */
export async function loadGroups() {
  return await readStorage('groups', 'sync')
}

/**
 * Save configured groups to storage
 *
 * @param {object[]} groups
 */
export async function saveGroups(groups) {
  return await writeStorage('groups', groups, 'sync')
}

/**
 * Generate a random identifier
 *
 * @returns {string}
 */
export function generateId() {
  return Math.round(Math.random() * 10 ** 8).toString(16)
}
