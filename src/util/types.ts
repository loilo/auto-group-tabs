import type { z } from 'zod'
import * as schemas from './schemas'

export type SaveOptions = z.infer<typeof schemas.SaveOptionsSchema>
export type GroupConfiguration = z.infer<
  typeof schemas.GroupConfigurationSchema
>

export type ExtensionOptions = {
  x: 1
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
