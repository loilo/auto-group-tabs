<template>
  <v-radio-group v-model="modelValue" class="color-menu">
    <template v-for="(label, color) in colorNames">
      <v-radio
        true-icon="mdi-radiobox-marked"
        false-icon="mdi-radiobox-blank"
        :base-color="`group-${color}`"
        :color="`group-${color}`"
        :value="color"
        :label
      />
    </template>
  </v-radio-group>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { colors } from '@/util/resources'

const colorRefs = Object.fromEntries(
  colors.map(color => [color, ref<HTMLInputElement>()]),
)

const modelValue = defineModel<`${chrome.tabGroups.Color}`>({
  required: true,
})

defineExpose({
  refresh() {
    // Unfortunately, relying on Vue is not enough when working with custom elements,
    // we need to manually re-set the `checked` prop
    // for (const color of colors) {
    //   colorRefs[color].value!.checked = color === modelValue.value
    // }
  },
})
</script>

<style scoped>
.color-menu :deep(.v-selection-control-group) {
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  & > * {
    grid-area: initial;
  }
}
</style>
