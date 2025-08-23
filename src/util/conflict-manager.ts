// The conflict manager is a collection of utilities that help with
// marking a string as conflicting by attaching a unique conflict marker to it

import { sanitizeRegex } from './helpers'

const conflictMarker = ' <conflict:%s>'
const conflictPattern = conflictMarker
  .split('%s')
  .map(sanitizeRegex)
  .join('[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}')
const conflictRegex = new RegExp(conflictPattern + '$')

function generateMarker() {
  return conflictMarker.split('%s').join(crypto.randomUUID())
}

export function hasMarker(title: string) {
  return conflictRegex.test(title)
}

export function withoutMarker(title: string) {
  return title.replace(conflictRegex, '')
}

export function withMarker(
  title: string,
  { recreate = false }: { recreate?: boolean } = {},
): string {
  if (hasMarker(title)) {
    if (recreate) {
      return withMarker(withoutMarker(title))
    } else {
      return title
    }
  } else {
    return `${title}${generateMarker()}`
  }
}
