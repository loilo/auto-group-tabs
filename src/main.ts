import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import i18n from './setup/i18n'
import colorNames from './setup/color-names'

import Options from './Options.vue'
import Popup from './Popup.vue'

import { RawTranslation, Translation } from './util/types'
import { isExtensionWorker } from './util/helpers'

import '@mdi/font/css/materialdesignicons.css'

const language = /^de-?/.test(
  isExtensionWorker ? chrome.i18n.getUILanguage() : navigator.language,
)
  ? 'de'
  : 'en'
window.document.documentElement.setAttribute('lang', language)

async function main() {
  const rawMessages: RawTranslation = await import(
    `./locale/${language}/messages.json`
  )
  const messages = Object.fromEntries(
    Object.entries(rawMessages).map(([key, { message }]) => [key, message]),
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

  const black = '#202124'
  const white = '#fff'
  const darkGrey = '#292a2d'
  const lightModePrimary = '#1a73e8'
  const darkModePrimary = '#8ab4f8'

  const colorsLight = {
    black,
    white,

    grey: '#5f6367',
    'on-grey': white,

    pale: white,
    'on-pale': '#5f6367',

    'light-grey': '#f8f9fa',
    'dark-grey': darkGrey,
    'blue-grey': '#9aa0a6',

    primary: lightModePrimary,
    'on-primary': white,

    'pale-primary': '#dfe7f1',
    'on-pale-primary': lightModePrimary,

    toolbar: lightModePrimary,
    'on-toolbar': white,

    dialog: white,
    'on-dialog': black,

    'dialog-contrast': white,
    'on-dialog-contrast': black,

    snackbar: '#f8f9fa',
    'on-snackbar': black,

    neutral: black,
    'on-neutral': white,

    'text-field-background': '#f5f5f5',

    'group-grey': '#5f6369',
    'on-group-grey': white,
    'group-blue': '#1974e8',
    'on-group-blue': white,
    'group-red': '#da3025',
    'on-group-red': white,
    'group-yellow': '#f9ab04',
    'on-group-yellow': black,
    'group-green': '#198139',
    'on-group-green': white,
    'group-pink': '#d01984',
    'on-group-pink': white,
    'group-purple': '#a143f5',
    'on-group-purple': white,
    'group-cyan': '#027b84',
    'on-group-cyan': white,
    'group-orange': '#fa913e',
    'on-group-orange': black,
  }

  const colorsDark = {
    ...colorsLight,

    primary: darkModePrimary,
    'on-primary': black,

    'pale-primary': '#38557a',
    'on-pale-primary': darkModePrimary,

    grey: '#b9c1ca',
    'on-grey': black,

    pale: black,
    'on-pale': '#9fa4a9',

    neutral: white,
    'on-neutral': black,

    toolbar: darkGrey,

    dialog: darkGrey,
    'on-dialog': white,

    'dialog-contrast': black,
    'on-dialog-contrast': white,

    snackbar: black,
    'on-snackbar': white,

    'text-field-background': '#202123',

    'group-grey': '#dbdce0',
    'on-group-grey': black,
    'group-blue': '#8ab3f8',
    'on-group-blue': black,
    'group-red': '#f18b82',
    'on-group-red': black,
    'group-yellow': '#fdd664',
    'on-group-yellow': black,
    'group-green': '#81ca95',
    'on-group-green': black,
    'group-pink': '#ff8bcc',
    'on-group-pink': black,
    'group-purple': '#c58afa',
    'on-group-purple': black,
    'group-cyan': '#78d9ed',
    'on-group-cyan': black,
    'group-orange': '#fcad70',
    'on-group-orange': black,
  }

  const vuetify = createVuetify({
    defaults: {
      VContainer: {
        fluid: true,
      },
      VBtn: {
        color: 'primary',
        variant: 'flat',
      },
      VTextField: {
        variant: 'outlined',
        hideDetails: 'auto',
        color: 'primary',
        density: 'compact',
      },
      VCheckbox: {
        hideDetails: 'auto',
        color: 'primary',
      },
      VSwitch: {
        hideDetails: 'auto',
        color: 'primary',
      },
      VSelect: {
        variant: 'outlined',
        hideDetails: 'auto',
      },
      VSnackbar: {
        timeout: 5_000,
      },
      VTooltip: {
        location: 'top',
        offset: 4,
        closeDelay: 0,
      },
      VToolbar: {
        color: 'toolbar',
      },
    },
    theme: {
      defaultTheme: 'system',
      themes: {
        light: {
          dark: false,
          variables: {
            'theme-overlay-multiplier': 2,
          },
          colors: {
            ...colorsLight,
          },
        },
        dark: {
          dark: true,
          variables: {
            'theme-overlay-multiplier': 2,
          },
          colors: {
            ...colorsDark,
          },
        },
      },
    },
  })

  const app = createApp(appComponent)
  app.use(pinia)
  app.use(vuetify)
  app.use(i18n, messages)
  app.use(colorNames, messages)

  app.mount('#app')
}

main().catch(error => {
  console.error('Error during app initialization:', error)
})
