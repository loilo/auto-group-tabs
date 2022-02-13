export type GroupConfiguration = {
  id: string
  title: string
  color: chrome.tabGroups.ColorEnum
  matchers: string[]
}

// Use JSON file as typings for messages
import type Messages from '@/static/_locales/en/messages.json'
type MessageKey = keyof typeof Messages

export type RawTranslation = {
  [P in MessageKey]: {
    message: string
    description: string
  }
}

export type Translation = {
  [P in MessageKey]: string
}
