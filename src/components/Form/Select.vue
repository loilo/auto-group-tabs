<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  options: Array<{ value: string; label: string }>
  validationMessage?: string
  validator?: (value: string) => boolean
}>()

defineOptions({
  inheritAttrs: false,
})

const model = defineModel<string | null>({ required: true })
</script>

<template>
  <div class="ui-select" :class="$attrs.class">
    <v-select
      v-bind="$attrs"
      v-model="model"
      :items="options"
      item-title="label"
      item-value="value"
    >
      <template #selection="data">
        <slot name="selection" v-bind="data" />
      </template>
      <template #prepend-item>
        <slot name="before" />
        <v-divider class="select-divider start" v-if="$slots.before" />
      </template>
      <template #item="{ props, item }">
        <v-list-item v-bind="props" :title="undefined">
          <slot v-bind="item">
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </slot>
        </v-list-item>
      </template>
      <template #append-item>
        <v-divider class="select-divider end" v-if="$slots.after" />
        <slot name="after" />
      </template>
    </v-select>
  </div>
</template>

<style scoped>
.select-divider {
  margin-block: 0.5rem;
}
</style>
