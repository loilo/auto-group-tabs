<template>
  <div class="pattern-list">
    <div
      v-for="(matcher, index) in localMatchers"
      :key="matcher.id"
      class="pattern-list-item"
    >
      <Textfield
        :ref="(component: any) => {
            if (component === null) {
              delete matcherRefs[matcher.id]
            } else {
              matcherRefs[matcher.id] = {component, index}
            }
          }"
        :modelValue="matcher.pattern"
        @update:modelValue="matcher.pattern = $event; updateMatchers()"
        :pattern="matcher.isRegex ? undefined : matcherPattern"
        :placeholder="msg.urlInputPlaceholder"
        @change="updateMatchers"
        @keydown.backspace="backspaceFromMatcherInput(index)"
        @keydown.enter="returnFromMatcherInput(index)"
        @keydown.escape="triggerBlur"
        :validation-message="matcher.isRegex ? 'Invalid Regex' : msg.invalidUrlPattern"
        auto-validate
      />
      <mwc-button
        class="pattern-regex-button"
        label="Regex"
        :unelevated="matcher.isRegex"
        :outlined="!matcher.isRegex"
        @click="matcher.isRegex = !matcher.isRegex; updateMatchers()"
        :title="msg.regexToggleTooltip"
      ></mwc-button>
      <mwc-icon-button
        icon="remove_circle_outline"
        class="pattern-delete-button"
        @click="removeMatcher(index)"
        :title="msg.removePatternTooltip" 
        v-if="!(props.keepOne && localMatchers.length === 1)"
      ></mwc-icon-button>
      <a
        tabindex="-1"
        class="pattern-list-info"
        href="https://developer.chrome.com/docs/extensions/mv3/match_patterns/"
        target="_blank"
        rel="noopener"
        :title="msg.matchPatternInfo"
        v-html="
          `<mwc-icon-button tabindex='-1' icon='info_outline'></mwc-icon-button>`
        "
      />
    </div>
    <SlideVertical :disabled="justCreatedNewMatcher" :duration="0.3">
      <div
        v-if="showNewMatcherInput || (props.keepOne && localMatchers.length === 0)"
        class="pattern-list-item"
        ref="newMatcherContainer"
        @focusout="handleBlur"
      >
        <Textfield
          class="pattern-input"
          ref="newMatcherTextfieldRef"
          v-model="newMatcherPatternValue"
          :pattern="newMatcherIsRegex ? undefined : matcherPattern"
          :placeholder="msg.furtherUrlInputPlaceholder"
          @change="handleNewMatcher"
          @keydown.backspace="backspaceFromMatcherInput(-1)"
          @keydown.enter="returnFromMatcherInput(-1)"
          @keydown.escape="triggerBlur"
          :validation-message="newMatcherIsRegex ? 'Invalid Regex' : msg.invalidUrlPattern"
          auto-validate
        />
        <mwc-button
          class="pattern-regex-button"
          label="Regex"
          :unelevated="newMatcherIsRegex"
          :outlined="!newMatcherIsRegex"
          @click="newMatcherIsRegex = !newMatcherIsRegex"
          :title="msg.regexToggleTooltip"
        ></mwc-button>
        <a
          tabindex="-1"
          class="pattern-list-info"
          href="https://developer.chrome.com/docs/extensions/mv3/match_patterns/"
          target="_blank"
          rel="noopener"
          :title="msg.matchPatternInfo"
          v-html="
            `<mwc-icon-button tabindex='-1' icon='info_outline'></mwc-icon-button>`
          "
        />
      </div>
    </SlideVertical>
  </div>
</template>

<script lang="ts" setup>
import Textfield from './Form/Textfield.vue'
import SlideVertical from './Util/SlideVertical.vue'
// Import MwcSwitch if not already globally available, though it should be via main.ts
// import '@material/mwc-switch'; // Ensure MWC Switch is registered

import { tickResetRef, useSyncedCopy } from '@/composables'
import { matcherPattern } from '@/util/helpers'
import { computed, nextTick, ref } from 'vue'

// Define the structure for a matcher object
interface MatcherObject {
  id: string; // Internal ID for v-for key and refs
  pattern: string;
  isRegex: boolean;
}

// Define the structure for the emitted matcher, without the internal id
interface EmittedMatcherObject {
  pattern: string;
  isRegex: boolean;
}

const props = defineProps<{
  modelValue: EmittedMatcherObject[], // Changed from string[]
  keepOne?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', options: EmittedMatcherObject[]): void // Changed from string[]
}>()

const matcherRefs = ref<Record<string, { component: any; index: number }>>({})
const sortedMatcherRefs = computed(() =>
  Object.values(matcherRefs.value)
    .sort((a, b) => a.index - b.index)
    .map(({ component }) => component)
)

// Create a copy of the matchers prop for easier local mutability
const localMatchers = useSyncedCopy<MatcherObject[]>(() => { // Explicitly type useSyncedCopy
  const items: MatcherObject[] = props.modelValue.map(matcher => ({
    id: crypto.randomUUID(),
    pattern: matcher.pattern,
    isRegex: matcher.isRegex
  }))

  if (items.length === 0 && props.keepOne) {
    items.push({ id: crypto.randomUUID(), pattern: '', isRegex: false })
  }

  return items
})

defineExpose({
  focus(index: number) {
    matcherRefs.value[localMatchers.value[index].id].component.focus()
  },
  showNewMatcher
})

const justCreatedNewMatcher = tickResetRef(false)
const newMatcherPatternValue = ref('') // For the pattern string of the new matcher
const newMatcherIsRegex = ref(false)   // For the isRegex state of the new matcher
const newMatcherTextfieldRef = ref() // Ref for the new matcher Textfield component
const showNewMatcherInput = ref(false)

const isEmptyPattern = (pattern: string) => pattern.trim().length === 0
const isEmptyMatcherObject = (matcher: MatcherObject) => isEmptyPattern(matcher.pattern)
const not =
  <T extends (...args: any[]) => boolean>(fn: T) =>
  (...args: Parameters<T>) =>
    !fn(...args)

function getFinalMatcherObjects(): EmittedMatcherObject[] {
  let validMatchers = localMatchers.value;

  if (validMatchers.some(isEmptyMatcherObject)) {
    validMatchers = validMatchers.filter(not(isEmptyMatcherObject));
  }

  return validMatchers.map(({ pattern, isRegex }) => ({ pattern, isRegex }));
}

function showNewMatcher() {
  showNewMatcherInput.value = true

  nextTick(() => {
    newMatcherTextfieldRef.value?.focus()
  })
}

function returnFromMatcherInput(matcherIndex: number) {
  // Ensure any pending updates to pattern or isRegex are processed
  updateMatchers();
  setTimeout(() => {
    if (matcherIndex === -1) { // If coming from the new matcher input
      if (newMatcherPatternValue.value.trim().length > 0) { // if it has content, add it
        handleNewMatcher(); // This will clear newMatcherPatternValue and potentially hide the input
        showNewMatcher();   // Then show a fresh new matcher input
      } else {
         newMatcherTextfieldRef.value?.focus() // Keep focus if empty
      }
    } else if (matcherIndex < localMatchers.value.length - 1) {
      // Focus next existing matcher
      const nextMatcherId = localMatchers.value[matcherIndex + 1].id;
      matcherRefs.value[nextMatcherId]?.component.focus();
    } else if (localMatchers.value[matcherIndex].pattern.trim().length > 0) {
      // If it's the last existing matcher and has content, show new input
      showNewMatcher()
    }
  }, 0)
}

function backspaceFromMatcherInput(matcherIndex: number) {
  setTimeout(() => {
    const currentPatternIsEmpty = matcherIndex === -1 ?
      newMatcherPatternValue.value.length === 0 :
      localMatchers.value[matcherIndex].pattern.length === 0;

    if (!currentPatternIsEmpty) return; // Only act if current field is empty

    if (matcherIndex === -1) { // From new matcher input
      if (localMatchers.value.length > 0) {
        const lastMatcherId = localMatchers.value[localMatchers.value.length - 1].id;
        matcherRefs.value[lastMatcherId]?.component.focus();
        // Optionally, if new matcher was empty and we move to last, we might want to remove new matcher line
        // showNewMatcherInput.value = false; // Consider this
      } else {
        newMatcherTextfieldRef.value?.blur()
      }
    } else { // From an existing matcher input
       // Remove the current empty matcher if it's not the only one (and keepOne is not forcing it)
      if (localMatchers.value.length > 1 || !props.keepOne) {
        localMatchers.value.splice(matcherIndex, 1);
        updateMatchers(); // Emit update
      }

      if (matcherIndex > 0 && localMatchers.value.length > 0) {
         const prevMatcherId = localMatchers.value[Math.max(0, matcherIndex - 1)].id;
         matcherRefs.value[prevMatcherId]?.component.focus();
      } else if (localMatchers.value.length === 0 && props.keepOne) {
        // If all removed and keepOne, ensure one empty input remains (localMatchers should handle this)
        // Potentially focus new input if no existing ones are left.
        showNewMatcher();
      } else if (localMatchers.value.length > 0) {
         // Focus the current (now previous, or first) item if list shifted
        const firstMatcherId = localMatchers.value[0].id;
        matcherRefs.value[firstMatcherId]?.component.focus();
      } else {
        // No items left, focus the "new matcher" input
        showNewMatcher();
      }
    }
  }, 0)
}


function handleNewMatcher() {
  const patternToAdd = newMatcherPatternValue.value.trim();
  if (isEmptyPattern(patternToAdd)) return;

  // Check for duplicates before adding
  const currentPatterns = getFinalMatcherObjects();
  if (currentPatterns.some(m => m.pattern === patternToAdd)) {
    // Optionally show an error or just don't add
    console.warn("Duplicate pattern, not adding:", patternToAdd);
    return;
  }

  if (newMatcherTextfieldRef.value?.isValid()) { // Assuming Textfield has an isValid method
    justCreatedNewMatcher.value = true
    
    // Add to localMatchers first for UI reactivity
    localMatchers.value.push({
      id: crypto.randomUUID(),
      pattern: patternToAdd,
      isRegex: newMatcherIsRegex.value
    });
    
    updateMatchers(); // This will emit the full updated list

    // Reset for next new matcher
    newMatcherPatternValue.value = ''
    newMatcherIsRegex.value = false // Default new regex to false
    // showNewMatcherInput.value = false; // Decide if new input row should hide after adding
    nextTick(() => { // Keep the new input row visible and focus it
      showNewMatcherInput.value = true;
      newMatcherTextfieldRef.value?.focus();
    });
  }
}

function triggerBlur(event: KeyboardEvent) {
  (event.target as HTMLElement).blur()
}

const newMatcherContainer = ref<HTMLElement>()
function handleBlur() { // For the container of the new matcher input
  setTimeout(() => {
    if (
      !newMatcherContainer.value?.contains(document.activeElement) &&
      newMatcherPatternValue.value.trim().length === 0
    ) {
      // If new matcher input is blurred and empty, hide it
      // unless there are no other matchers and keepOne is true.
      if (localMatchers.value.length > 0 || !props.keepOne) {
         showNewMatcherInput.value = false
      }
    }
  }, 0)
}

function removeMatcher(index: number) {
  if (index >= 0 && index < localMatchers.value.length) {
    localMatchers.value.splice(index, 1);
    updateMatchers();

    // If keepOne is true and we removed the last item, add a new empty one
    if (props.keepOne && localMatchers.value.length === 0) {
      localMatchers.value.push({ id: crypto.randomUUID(), pattern: '', isRegex: false });
      // No need to call updateMatchers() here as it's implicitly handled by the push, 
      // or will be handled if this new empty one is also immediately modified/removed.
      // However, to be safe and ensure UI consistency if an empty one is required immediately:
      updateMatchers(); 
    }
  }
}

function updateMatchers() {
  emit('update:modelValue', getFinalMatcherObjects())
}

// Ensure at least one input is shown if keepOne is true and modelValue is empty
if (props.keepOne && props.modelValue.length === 0 && localMatchers.value.length === 0) {
  localMatchers.value.push({ id: crypto.randomUUID(), pattern: '', isRegex: false });
}
// Ensure the "new matcher" input row is visible if there are no initial patterns.
if (localMatchers.value.length === 0 && !props.keepOne) {
  showNewMatcherInput.value = true;
}


</script>

<style lang="scss" scoped>
.pattern-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pattern-list-item { // Renamed from pattern-list-new for clarity
  display: flex;
  align-items: center;
  gap: 0.5rem; // Add gap between textfield, switch, and info
  position: relative;
}

.pattern-input {
  flex-grow: 1; // Allow textfield to take available space
}

.pattern-regex-button { // Changed from pattern-regex-toggle
  // Style the button if needed, e.g., min-width, height to match textfield
  min-width: 80px; // Example: Adjust as needed
  --mdc-theme-primary: var(--group-blue); // Example: Use a theme color for unelevated state
}

.pattern-list-info {
  display: block; 
  color: var(--dimmed-foreground, initial); /* Corrected fallback color */
  // flex-shrink: 0; 
}

/* Target the mwc-icon-button rendered via v-html */
.pattern-list-info ::v-deep(mwc-icon-button) {
  color: var(--dimmed-foreground, initial); /* Corrected fallback color */
  /* Alternatively, try MWC custom property if the above doesn't penetrate shadow DOM effectively */
  /* --mdc-icon-button-icon-color: var(--dimmed-foreground, initial); */ 
}
</style>
