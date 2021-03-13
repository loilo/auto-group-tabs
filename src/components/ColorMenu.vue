<template>
  <div class="color-menu">
    <mwc-radio
      v-for="(label, color) in colorNames"
      :key="color"
      :ref="`color-${color}`"
      :title="label"
      :checked="color === modelValue"
      :style="{
        '--mdc-theme-secondary': `var(--group-${color})`,
        '--mdc-radio-unchecked-color': `var(--group-${color})`
      }"
      @change="handleChange(color)"
    />
  </div>
</template>

<script>
import ColorIndicator from './ColorIndicator.vue'
import { colors } from '../shared/resources'

export default {
  components: { ColorIndicator },
  props: {
    anchor: Object,
    modelValue: String
  },
  emits: ['update:modelValue'],
  data: () => ({ colors }),
  methods: {
    handleChange(color) {
      this.$emit('update:modelValue', color)
    },
    refresh() {
      // Unfortunately, relying on Vue is not enough when working with custom elements,
      // we need to manually re-set the `checked` prop
      for (const color of Object.keys(this.colorNames)) {
        this.$refs[`color-${color}`].checked = color === this.modelValue
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.color-menu {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.color-button {
  --mdc-icon-button-size: 24px;
}

.color {
  --mdc-list-item-graphic-size: 16px;
}

mwc-radio {
  text-align: center;
}
</style>
