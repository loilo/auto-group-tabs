<script lang="ts" setup>
import PatternList from '@/components/PatternList.vue'
import { inject, ref } from 'vue'

import {
  deriveMatcherOptions,
  MatcherOptions,
} from '@/util/derive-matcher-options'
import { Translation } from '@/util/types'
import { useSyncedCopy } from '@/composables'
import { isExtensionWorker } from '@/util/helpers'

const patternListRef = ref<InstanceType<typeof PatternList>>()

defineExpose({
  focus(index: number) {
    return patternListRef.value!.focus(index)
  },
  showNewMatcher() {
    return patternListRef.value!.showNewMatcher()
  },
})

const options = ref<MatcherOptions[]>([])
const msg = inject<Translation>('msg')!

if (isExtensionWorker) {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  })

  if (tab) {
    options.value = deriveMatcherOptions(tab.url!, msg)
  }
} else {
  options.value = deriveMatcherOptions(
    new URL(location.href).searchParams.get('url') ?? 'chrome://newtab/',
    msg,
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
  newValue => emit('update:modelValue', newValue),
)
</script>

<template>
  <div class="suggestions">
    <span class="suggestions-title">{{ msg.suggestionTitle }}:</span>

    <template v-for="option in options">
      <v-btn
        @click="patterns = option.patterns"
        variant="text"
        density="compact"
      >
        {{ option.description }}
      </v-btn>
    </template>
  </div>
  <PatternList ref="patternListRef" v-model="patterns" keep-one />
</template>

<style scoped>
.suggestions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.25rem;
}

.suggestions-title {
  color: var(--dimmed-foreground);
  font-weight: 500;
}
</style>
