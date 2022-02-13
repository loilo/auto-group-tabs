import '@a11y/focus-trap/index'
import '@material/mwc-button'
import '@material/mwc-icon-button'
import '@material/mwc-fab'
import '@material/mwc-formfield'
import '@material/mwc-radio'
import '@material/mwc-snackbar'
import '@material/mwc-switch'
import '@material/mwc-checkbox'
import '@material/mwc-textfield'
import '@material/mwc-top-app-bar'
import '@material/mwc-top-app-bar-fixed'

import { createApp } from 'vue'
import i18n from './setup/i18n'
import colorNames from './setup/color-names'

import App from './App.vue'
import { RawTranslation } from './util/types'

const language = /^de-?/.test(
  typeof chrome.i18n !== 'undefined'
    ? chrome.i18n.getUILanguage()
    : navigator.language
)
  ? 'de'
  : 'en'
window.document.documentElement.setAttribute('lang', language)

async function main() {
  let rawMessages: RawTranslation = await import(
    `./static/_locales/${language}/messages.json`
  )
  let messages = Object.fromEntries(
    Object.entries(rawMessages).map(([key, { message }]) => [key, message])
  )

  const app = createApp(App)
  app.use(i18n, messages)
  app.use(colorNames, messages)

  app.mount('#app')
}

main()
