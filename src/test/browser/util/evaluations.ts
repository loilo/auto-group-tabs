import { GroupConfiguration } from '@/util/types'

export function isFocused(element: HTMLElement | SVGElement) {
  return document.activeElement === element
}

export function isValid(input: HTMLElement | SVGElement) {
  return (input as HTMLInputElement)?.checkValidity?.() ?? false
}

export function getValue(input: HTMLElement | SVGElement) {
  return (input as HTMLInputElement)?.value
}

export function getGroups() {
  return JSON.parse(localStorage.groups || '[]') as GroupConfiguration[]
}

export type GroupConfigurationWithoutId = Omit<GroupConfiguration, 'id'>

export function setGroups(groups: GroupConfigurationWithoutId[]) {
  const supplementedGroups = groups.map(group => ({
    ...group,
    id: crypto.randomUUID()
  }))
  localStorage.groups = JSON.stringify(supplementedGroups)
}

export function isMacOS() {
  return navigator.platform.includes('Mac')
}

export function waitAnimationsFinished(element: HTMLElement | SVGElement) {
  return Promise.all(
    element
      .getAnimations({ subtree: true })
      .map(animation => animation.finished)
  )
}
