import { colors } from '@/util/resources'
import { capitalize } from '@/util/helpers'
import { App } from 'vue'

export default {
  install(app: App, msg: { [key: string]: string }) {
    const colorNames: { [P in (typeof colors)[number]]: string } =
      Object.fromEntries(
        colors.map(name => [name, capitalize(msg[`color${capitalize(name)}`])]),
      ) as any

    // For usage in <script setup>
    app.provide('colorNames', colorNames)

    // For usage in templates without inject()
    app.mixin({
      computed: { colorNames: () => colorNames },
    })
  },
}
