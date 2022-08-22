<script lang="ts" setup>
import PatternList from './PatternList.vue'
import { inject, ref } from 'vue'

import {
  deriveMatcherOptions,
  MatcherOptions
} from '@/util/derive-matcher-options'
import { Translation } from '@/util/types'
import { useSyncedCopy } from '@/composables'

const patternListRef = ref<InstanceType<typeof PatternList>>()

defineExpose({
  focus(index: number) {
    return patternListRef.value!.focus(index)
  },
  showNewMatcher() {
    return patternListRef.value!.showNewMatcher()
  }
})

const options = ref<MatcherOptions[]>([])
const msg = inject<Translation>('msg')!

if (typeof chrome.tabs !== 'undefined') {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  })

  if (tab) {
    options.value = deriveMatcherOptions(tab.url!, msg)
  }
} else {
  options.value = deriveMatcherOptions(
    new URL(location.href).searchParams.get('url') ?? 'chrome://newtab/',
    msg
  )
}

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: string[]): void
}>()

const patterns = useSyncedCopy(
  () => props.modelValue,
  newValue => emit('update:modelValue', newValue)
)
</script>

<template>
  <div class="suggestions">
    <span class="suggestions-title">{{ msg.suggestionTitle }}:</span>

    <!-- eslint-disable vue/valid-v-for -->
    <mwc-button
      dense
      v-for="option in options"
      @click="patterns = option.patterns"
    >
      {{ option.description }}
    </mwc-button>
    <!-- eslint-enable vue/valid-v-for -->
  </div>
  <PatternList ref="patternListRef" v-model="patterns" keep-one />
</template>

<style lang="scss" scoped>
.suggestions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.25rem;
}

.suggestions-title {
  color: var(--dimmed-foreground);
  font-weight: var(--mdc-typography-button-font-weight, 500);
}
</style>
