import { colors } from '../shared/resources'
import { capitalize } from '../shared/util'

export default {
  install(app, msg) {
    const colorNames = Object.fromEntries(
      colors.map(name => [name, capitalize(msg[`color${capitalize(name)}`])])
    )

    // For usage in <script setup>
    app.provide('colorNames', colorNames)

    // For usage in templates without inject()
    app.mixin({
      computed: { colorNames: () => colorNames }
    })
  }
}
