export default {
  install(app) {
    // Use Vite's import.meta.glob feature to autoload components
    const globalComponents = import.meta.globEager('../components/*.{vue,js}')

    for (const [path, module] of Object.entries(globalComponents)) {
      const componentName = path.replace(/^.*?([^/]+)\.(vue|js)$/, '$1')
      const componentConfig = module.default

      app.component(componentName, componentConfig)
    }
  }
}
