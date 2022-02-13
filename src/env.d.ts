/// <reference types="vite/client" />

import type { DefineComponent } from 'vue'
import { Translation } from './util/types'

declare module 'vue' {
  interface ComponentCustomProperties {
    msg: Translation
    colorNames: Record<chrome.tabGroups.ColorEnum, string>
  }
}

declare module '*.vue' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>

  export default component
}

declare global {
  interface Crypto {
    randomUUID(): string
  }
}
