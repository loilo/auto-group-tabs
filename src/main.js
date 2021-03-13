import '@a11y/focus-trap/index.js'
import '@material/mwc-button'
import '@material/mwc-icon-button'
import '@material/mwc-fab'
import '@material/mwc-radio'
import '@material/mwc-snackbar'
import '@material/mwc-switch'
import '@material/mwc-textfield'

import { createApp } from 'vue'
import i18n from './setup/i18n'
import autoload from './setup/autoload'
import bubble from './setup/bubble'
import colorNames from './setup/color-names'

import App from './App.vue'

const language = /^de-?/.test(
  typeof chrome.i18n !== 'undefined'
    ? chrome.i18n.getUILanguage()
    : navigator.language
)
  ? 'de'
  : 'en'
window.document.documentElement.setAttribute('lang', language)

async function main() {
  let messages = await import(`./static/_locales/${language}/messages.json`)
  messages = Object.fromEntries(
    Object.entries(messages).map(([key, { message }]) => [key, message])
  )

  const app = createApp(App)
  app.use(i18n, messages)
  app.use(autoload)
  app.use(bubble)
  app.use(colorNames, messages)

  app.mount('#app')
}

main()
