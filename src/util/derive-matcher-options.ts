import { Translation } from './types'

export type MatcherOptions = {
  patterns: string[]
  description: string
}

function deriveChromeMatcherOptions(
  rawUrl: string,
  url: URL,
  msg: Translation
) {
  const options: MatcherOptions[] = []

  const [initialGroup] = url.host.split('/')
  const [, secondaryGroup] = url.pathname.split('/')

  const initialGroupPatterns = [
    `chrome://${initialGroup}`,
    `chrome://${initialGroup}/*`
  ]

  const wellKnownInitialGroupNames = {
    extensions: msg.derivedNameChromeExtensions,
    downloads: msg.derivedNameChromeDownloads,
    history: msg.derivedNameChromeHistory,
    bookmarks: msg.derivedNameChromeBookmarks,
    apps: msg.derivedNameChromeApps,
    flags: msg.derivedNameChromeFlags
  }

  if (initialGroup in wellKnownInitialGroupNames) {
    options.push({
      patterns: initialGroupPatterns,
      description:
        wellKnownInitialGroupNames[
          initialGroup as keyof typeof wellKnownInitialGroupNames
        ]
    })
  } else if (initialGroup === 'settings') {
    if (secondaryGroup) {
      options.push({
        patterns: [
          `chrome://settings/${secondaryGroup}`,
          `chrome://settings/${secondaryGroup}/*`
        ],
        description: msg.derivedNameChromeSettingsSection
      })
    }

    options.push({
      patterns: initialGroupPatterns,
      description: msg.derivedNameChromeSettings
    })
  } else if (initialGroup === 'newtab') {
    options.push({
      patterns: [rawUrl],
      description: msg.derivedNameChromeNewtab
    })
  } else {
    options.push({
      patterns: initialGroupPatterns,
      description: `${msg.derivedNameChromePage} "${initialGroup}"`
    })
  }

  options.push({
    patterns: ['chrome://*'],
    description: msg.derivedNameChromeAll
  })

  if (!options.some(({ patterns }) => patterns.includes(rawUrl))) {
    options.push({
      patterns: [rawUrl],
      description: msg.derivedNameChromeExactUrl
    })
  }

  return options
}

function deriveExtensionMatcherOptions(
  rawUrl: string,
  url: URL,
  msg: Translation
) {
  return [
    {
      patterns: [
        `${url.protocol}//${url.host || url.pathname.slice(2)}`,
        `${url.protocol}//${url.host || url.pathname.slice(2)}/*`
      ],
      description: msg.derivedNameExtensionHost
    },
    {
      patterns: [`${url.protocol}//*`],
      description: msg.derivedNameExtensionAll
    },
    {
      patterns: [rawUrl],
      description: msg.derivedNameExtensionExactUrl
    }
  ]
}

function deriveFileMatcherOptions(rawUrl: string, url: URL, msg: Translation) {
  const options: MatcherOptions[] = []

  const pathParts = url.pathname.split('/')
  const basename = pathParts.at(-1)
  const dirnamePath = pathParts.slice(0, -1).join('/')
  const dirname = pathParts.at(-2)

  options.push({
    patterns: ['file://*'],
    description: msg.derivedNameFileAll
  })

  if (dirnamePath) {
    options.push({
      patterns: [`file://${dirnamePath}/*`],
      description: basename
        ? msg.derivedNameFileDirname.replace('%s', dirname!)
        : msg.derivedNameFileThisFolder
    })
  }

  options.push({
    patterns: [rawUrl],
    description: basename
      ? msg.derivedNameFileExactFileUrl
      : msg.derivedNameFileExactFolderUrl
  })

  return options
}

function deriveHttpMatcherOptions(rawUrl: string, url: URL, msg: Translation) {
  const options: MatcherOptions[] = []

  // Generate hierarchical path-based patterns
  const pathSegments = url.pathname.split('/').filter(segment => segment)

  // Most specific: exact URL
  options.push({
    patterns: [rawUrl],
    description: msg.derivedNameGenericExactUrl
  })

  // Path-based patterns (from most specific to least specific)
  if (pathSegments.length > 0) {
    // Build patterns for each path level
    for (let i = pathSegments.length; i > 0; i--) {
      const pathPattern = pathSegments.slice(0, i).join('/')
      const pattern = `${url.host}/${pathPattern}/*`

      // Create a descriptive name based on the path
      const pathDescription = pathSegments.slice(0, i).join('/')
      const description = `${url.host}/${pathDescription} and subdirectories`

      options.push({
        patterns: [pattern],
        description: description
      })
    }
  }

  // Domain-level patterns with smart subdomain handling
  const baseHost = url.host.startsWith('www.') ? url.host.slice(4) : url.host
  const hasWww = url.host.startsWith('www.')

  if (hasWww) {
    // If URL has www, suggest the base domain (which will auto-include subdomains)
    options.push({
      patterns: [`${baseHost}`],
      description: `${baseHost} (includes www and other subdomains)`
    })

    // Also suggest the exact www version for precision
    options.push({
      patterns: [`${url.host}`],
      description: `${url.host} (www only)`
    })
  } else {
    // For non-www URLs, the base domain pattern will automatically include www
    options.push({
      patterns: [`${url.host}`],
      description: `${url.host} (includes www and other subdomains)`
    })
  }

  // For specific subdomains (like api.github.com), also suggest the base domain
  const parts = url.host.split('.')
  if (parts.length >= 3 && !url.host.startsWith('www.')) {
    // Extract potential base domain (last 2-3 parts depending on TLD)
    let baseDomainParts
    if (parts.length >= 3 && ['co', 'com', 'net', 'org', 'gov', 'edu', 'ac', 'mil'].includes(parts[parts.length - 2])) {
      // Country code TLD like .co.il, .co.uk
      baseDomainParts = parts.slice(-3)
    } else {
      // Regular TLD like .com, .org
      baseDomainParts = parts.slice(-2)
    }

    const baseDomain = baseDomainParts.join('.')
    if (baseDomain !== url.host) {
      options.push({
        patterns: [baseDomain],
        description: `All ${baseDomain} sites (includes subdomains)`
      })
    }
  }

  return options
}

export function deriveMatcherOptions(
  rawUrl: string,
  msg: Translation
): MatcherOptions[] {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return []
  }

  // chrome:// URLs
  if (url.protocol === 'chrome:') {
    return deriveChromeMatcherOptions(rawUrl, url, msg)
  }

  // extension:// and chrome-extension:// URLs
  if (/^(chrome-)?extension:$/.test(url.protocol)) {
    return deriveExtensionMatcherOptions(rawUrl, url, msg)
  }

  // file:// URLs
  if (url.protocol === 'file:') {
    return deriveFileMatcherOptions(rawUrl, url, msg)
  }

  // http(s):// URLs
  if (/^https?:$/.test(url.protocol)) {
    return deriveHttpMatcherOptions(rawUrl, url, msg)
  }

  // Generic fallback for all other URLs
  return [
    {
      patterns: [rawUrl],
      description: msg.derivedNameGenericExactUrl
    }
  ]
}
