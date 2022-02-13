// Provide a 'msg' containing all localization

import { App } from 'vue'
import { Translation } from '@/util/types'

export default {
  install(app: App, messages: Translation) {
    // For usage in <script setup>
    app.provide('msg', messages)

    // For usage in templates without inject()
    app.mixin({
      computed: { msg: () => messages }
    })
  }
}
