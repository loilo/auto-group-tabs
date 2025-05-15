<script lang="ts" setup>
import PatternList from '@/components/PatternList.vue'
import { inject, ref } from 'vue'

import {
  deriveMatcherOptions,
  MatcherOptions
} from '@/util/derive-matcher-options'
import { Translation } from '@/util/types'
import { useSyncedCopy } from '@/composables'
import { isExtensionWorker } from '@/util/helpers'

// Define the structure for the emitted matcher object
interface EmittedMatcherObject {
  pattern: string;
  isRegex: boolean;
}

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

if (isExtensionWorker) {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  })

  if (tab && tab.url) { // Ensure tab.url is defined
    options.value = deriveMatcherOptions(tab.url, msg)
  }
} else {
  options.value = deriveMatcherOptions(
    new URL(location.href).searchParams.get('url') ?? 'chrome://newtab/',
    msg
  )
}

const props = defineProps<{
  modelValue: EmittedMatcherObject[] // Changed from string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: EmittedMatcherObject[]): void // Changed from string[]
}>()

const patterns = useSyncedCopy<EmittedMatcherObject[]>( // Explicitly type useSyncedCopy
  () => props.modelValue,
  newValue => emit('update:modelValue', newValue)
)

function handleSuggestedPatterns(suggestedOptionPatterns: string[]) {
  if (suggestedOptionPatterns.length === 0) return;

  const primarySuggestion = suggestedOptionPatterns[0]; // Use the first suggestion

  if (patterns.value.length === 0) {
    // No existing patterns, add the new suggestion
    patterns.value = [
      {
        pattern: primarySuggestion,
        isRegex: false // Suggestions are not regex by default
      }
    ];
  } else {
    // Existing patterns, update the top one
    const updatedTopPattern = {
      ...patterns.value[0], // Preserve other properties like ID if it were part of EmittedMatcherObject
      pattern: primarySuggestion,
      isRegex: false
    };
    // Create a new array with the updated top pattern and the rest
    const newPatterns = [updatedTopPattern, ...patterns.value.slice(1)];
    patterns.value = newPatterns;
  }
}
</script>

<template>
  <div class="suggestions">
    <span class="suggestions-title">{{ msg.suggestionTitle }}:</span>

    <!-- eslint-disable vue/valid-v-for -->
    <mwc-button
      dense
      v-for="option in options"
      :key="option.description"
      @click="handleSuggestedPatterns(option.patterns)"
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
