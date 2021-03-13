export default {
  install(app) {
    // Provide an event bubbling utility
    app.mixin({
      computed: {
        bubble: vm =>
          new Proxy(
            {},
            { get: (_target, key) => (...args) => vm.$emit(key, ...args) }
          )
      }
    })
  }
}
