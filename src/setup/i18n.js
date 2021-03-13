// Provide a 'msg' containing all localization

export default {
  install(app, messages) {
    // For usage in <script setup>
    app.provide('msg', messages)

    // For usage in templates without inject()
    app.mixin({
      computed: { msg: () => messages }
    })
  }
}
