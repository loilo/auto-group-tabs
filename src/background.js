import { loadGroups, matcherPattern } from './shared/util'

/**
 * Generate a regular expression from a matcher string
 *
 * @param {string} matcher
 * @returns {RegExp}
 */
function generateRegex(matcher) {
  /**
   * Escape special characters in a regex string
   *
   * @param {string} string
   * @returns {string}
   */
  function sanitizeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * Replace asterisks in a regex string
   *
   * @param {string} string
   * @param {string} asteriskReplacement
   */
  function generatePatternString(string, asteriskReplacement) {
    return string.split('*').map(sanitizeRegex).join(asteriskReplacement)
  }

  const matcherPatternRegex = new RegExp(`^${matcherPattern}$`)

  const result = matcher.match(matcherPatternRegex)

  if (!result) return null
  const { scheme, host, path } = result.groups

  const schemePattern =
    typeof scheme === 'string'
      ? generatePatternString(scheme, 'https?')
      : 'https?|file|ftp'
  const hostPattern =
    typeof host === 'string'
      ? generatePatternString(
          host.startsWith('*.') ? `*${host.slice(2)}` : host,
          host === '*' ? '[^/]+.[^/]+|localhost(:[0-9]+)?' : '([^/]+.)?'
        )
      : '[^/]+.[^/]+'
  const pathPattern =
    typeof path === 'string' ? generatePatternString(path, '.*') : '.*'

  return new RegExp(`^(${schemePattern})://(${hostPattern})(/${pathPattern})?$`)
}

/**
 * Augment groups from storage with regular expressions for matchers
 *
 * @param {object[]} groups
 */
function augmentGroups(groups) {
  for (let group of groups) {
    group.matchers = group.matchers.map(generateRegex).filter(Boolean)
  }
}

/**
 * Initialize auto-grouping of tabs
 *
 * @param {object[]} groups
 */
async function main(groups) {
  // Update groups when they are reconfigured
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return
    if ('groups' in changes) {
      groups = JSON.parse(changes.groups.newValue)
      augmentGroups(groups)
    }
  })

  augmentGroups(groups)

  chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    // Ignore tab updates without URL change
    if (typeof changeInfo.url !== 'string') return

    // Ignore tabs that are already grouped
    if (tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) return

    // Ignore pinned tabs
    if (tab.pinned) return

    // Iterate group assignment configuration
    for (const { title, color, matchers } of groups) {
      for (const matcher of matchers) {
        if (!matcher.test(changeInfo.url)) continue

        // Get existing tab groups that match the currently iterated group
        const tabGroups = await new Promise(resolve => {
          chrome.tabGroups.query(
            {
              title,
              color,
              windowId: chrome.windows.WINDOW_ID_CURRENT
            },
            resolve
          )
        })

        // If no such tab groups exist, wait for the next new one and adjust its properties
        if (tabGroups.length === 0) {
          const adjustNewGroup = async newGroup => {
            await new Promise(resolve => {
              chrome.tabGroups.update(newGroup.id, { title, color }, resolve)
            })

            chrome.tabGroups.onCreated.removeListener(adjustNewGroup)
          }

          chrome.tabGroups.onCreated.addListener(adjustNewGroup)
        }

        // Assign the tab to the specified group
        // If the group does not exist, it is created in the process
        await new Promise(resolve => {
          chrome.tabs.group(
            {
              tabIds: tabId,
              groupId: tabGroups.length > 0 ? tabGroups[0].id : undefined
            },
            resolve
          )
        })

        // Our work here is done, we can safely exit
        return
      }
    }
  })
}

loadGroups().then(main)
