<template>
  <div class="color-menu">
    <mwc-formfield
      v-for="(label, color) in colorNames"
      :key="color"
      :label="label"
    >
      <mwc-radio
        :ref="(el: HTMLInputElement) => { colorRefs[color].value = el as HTMLInputElement }"
        :checked="color === modelValue"
        :style="{
          '--mdc-theme-secondary': `var(--group-${color})`,
          '--mdc-radio-unchecked-color': `var(--group-${color})`
        }"
        @change="emit('update:modelValue', color)"
      />
    </mwc-formfield>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { colors } from '@/util/resources'

const colorRefs = Object.fromEntries(
  colors.map(color => [color, ref<HTMLInputElement>()])
)

const props = defineProps<{
  modelValue: chrome.tabGroups.ColorEnum
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: string): void
}>()

defineExpose({
  refresh() {
    // Unfortunately, relying on Vue is not enough when working with custom elements,
    // we need to manually re-set the `checked` prop
    for (const color of colors) {
      colorRefs[color].value!.checked = color === props.modelValue
    }
  }
})
</script>

<style lang="scss" scoped>
.color-menu {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
