import '@a11y/focus-trap/index'
import '@material/mwc-button'
import '@material/mwc-icon-button'
import '@material/mwc-fab'
import '@material/mwc-formfield'
import '@material/mwc-list'
import '@material/mwc-menu'
import '@material/mwc-radio'
import '@material/mwc-select'
import '@material/mwc-snackbar'
import '@material/mwc-switch'
import '@material/mwc-checkbox'
import '@material/mwc-textfield'
import '@material/mwc-textarea'
import '@material/mwc-top-app-bar'
import '@material/mwc-top-app-bar-fixed'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import i18n from './setup/i18n'
import colorNames from './setup/color-names'

import Options from './Options.vue'
import Popup from './Popup.vue'

import { RawTranslation, Translation } from './util/types'
import { isExtensionWorker } from './util/helpers'

const language = /^de-?/.test(
  isExtensionWorker ? chrome.i18n.getUILanguage() : navigator.language
)
  ? 'de'
  : 'en'
window.document.documentElement.setAttribute('lang', language)

async function main() {
  try {
    const rawMessages: RawTranslation = await import(
      `./static/_locales/${language}/messages.json`
    )
    const messages = Object.fromEntries(
      Object.entries(rawMessages).map(([key, { message }]) => [key, message])
    ) as Translation

    const context = new URL(location.href).searchParams.get('context')
    let appComponent: any
    switch (context) {
      case 'popup':
        appComponent = Popup
        break

      default:
        appComponent = Options
        break
    }

    const pinia = createPinia()
    const app = createApp(appComponent)
    app.use(pinia)
    app.use(i18n, messages)
    app.use(colorNames, messages)

    app.mount('#app')
  } catch (error) {
    console.error('Failed to initialize application:', error)
    // Fallback to English if language loading fails
    if (language !== 'en') {
      console.warn('Falling back to English locale')
      try {
        const rawMessages: RawTranslation = await import(
          './static/_locales/en/messages.json'
        )
        const messages = Object.fromEntries(
          Object.entries(rawMessages).map(([key, { message }]) => [key, message])
        ) as Translation

        const context = new URL(location.href).searchParams.get('context')
        const appComponent = context === 'popup' ? Popup : Options

        const pinia = createPinia()
        const app = createApp(appComponent)
        app.use(pinia)
        app.use(i18n, messages)
        app.use(colorNames, messages)

        app.mount('#app')
      } catch (fallbackError) {
        console.error('Failed to load fallback locale:', fallbackError)
        document.body.innerHTML = '<div style="padding: 20px; color: red;">Failed to load extension. Please reload the page.</div>'
      }
    } else {
      document.body.innerHTML = '<div style="padding: 20px; color: red;">Failed to load extension. Please reload the page.</div>'
    }
  }
}

main().catch(error => {
  console.error('Unhandled error in main():', error)
})
