<template>
  <div class="pattern-list">
    <div
      v-for="(matcher, index) in localMatchers"
      :key="matcher.id"
      class="pattern-list-new"
    >
      <Textfield
        :ref="(component: any) => {
            if (component === null) {
              delete matcherRefs[matcher.id]
            } else {
              matcherRefs[matcher.id] = {component, index}
            }
          }"
        :modelValue="matcher.value"
        @update:modelValue="matcher.value = $event"
        :pattern="matcherPattern"
        :placeholder="msg.urlInputPlaceholder"
        @change="updateMatchers"
        @keydown.backspace="
          matcher.value.length === 0 && backspaceFromMatcherInput(index)
        "
        @keydown.enter="returnFromMatcherInput(index)"
        @keydown.escape="($event.target as HTMLElement).blur()"
        :validation-message="msg.invalidUrlPattern"
      />
      <!--
          The production build partly eradicates the info icon when used as a
          regular component, therefore we inject it as innerHTML.
          -->
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
        v-if="showNewMatcherInput"
        class="pattern-list-new"
        ref="newMatcherContainer"
        @focusout="handleBlur"
      >
        <Textfield
          ref="newMatcher"
          v-model="newMatcherValue"
          :pattern="matcherPattern"
          :placeholder="msg.urlInputPlaceholder"
          @change="handleNewMatcher"
          @keydown.backspace="
            newMatcherValue.length === 0 && backspaceFromMatcherInput(-1)
          "
          @keydown.enter="returnFromMatcherInput(-1)"
          @keydown.escape="($event.target as HTMLElement).blur()"
          :validation-message="msg.invalidUrlPattern"
          auto-validate
        />

        <!--
          The production build partly eradicates the info icon when used as a
          regular component, therefore we inject it as innerHTML.
          -->
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

import { computed, nextTick, ref, toRaw, toRef, watch } from 'vue'
import { matcherPattern } from '@/util/helpers'
import { tickResetRef, useSyncedCopy } from '@/composables'

const props = defineProps<{
  modelValue: string[]
  keepOne?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', options: string[]): void
}>()

const matcherRefs = ref<Record<string, { component: any; index: number }>>({})
const sortedMatcherRefs = computed(() =>
  Object.values(matcherRefs.value)
    .sort((a, b) => a.index - b.index)
    .map(({ component }) => component)
)

// Create a copy of the matchers prop for easier local mutability
const localMatchers = useSyncedCopy(() => {
  const items = props.modelValue.map(matcher => ({
    id: crypto.randomUUID(),
    value: matcher
  }))

  if (items.length === 0 && props.keepOne) {
    items.push({ id: crypto.randomUUID(), value: '' })
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
const newMatcherValue = ref('')
const newMatcher = ref()
const showNewMatcherInput = ref(false)

const isEmpty = (value: string) => value.trim().length === 0
const isEmptyMatcher = (matcher: { value: string }) => isEmpty(matcher.value)
const not =
  <T extends (...args: any[]) => boolean>(fn: T) =>
  (...args: Parameters<T>) =>
    !fn(...args)

function getNonEmptyMatchers() {
  let matchers = localMatchers.value

  if (matchers.some(isEmptyMatcher)) {
    matchers = matchers.filter(not(isEmptyMatcher))
  }

  return matchers.map(({ value }) => value)
}

function showNewMatcher() {
  showNewMatcherInput.value = true

  nextTick(() => {
    newMatcher.value.focus()
  })
}

function returnFromMatcherInput(matcherIndex: number) {
  setTimeout(() => {
    if (matcherIndex === -1) {
      console.log(1)
      showNewMatcher()
      nextTick(() => {
        newMatcher.value.focus()
      })
    } else if (matcherIndex < sortedMatcherRefs.value.length - 1) {
      console.log(2)
      sortedMatcherRefs.value[matcherIndex + 1]?.focus()
    } else if (localMatchers.value[matcherIndex].value.length > 0) {
      showNewMatcher()
    }
  }, 0)
}

function backspaceFromMatcherInput(matcherIndex: number) {
  setTimeout(() => {
    if (matcherIndex === -1) {
      if (sortedMatcherRefs.value.length > 0) {
        sortedMatcherRefs.value[sortedMatcherRefs.value.length - 1].focus()
      } else {
        newMatcher.value.blur()
      }
    } else if (matcherIndex > 0) {
      sortedMatcherRefs.value[matcherIndex].blur()

      // As the list re-renders after blurring, we need to
      // wait a moment before focusing one of its elements
      setTimeout(() => {
        sortedMatcherRefs.value[matcherIndex - 1].focus()
      }, 0)
    } else {
      sortedMatcherRefs.value[matcherIndex].blur()
    }
  }, 0)
}

function handleNewMatcher() {
  const validMatchers = getNonEmptyMatchers()

  if (
    !isEmpty(newMatcherValue.value) &&
    newMatcher.value?.isValid() &&
    !validMatchers.includes(newMatcherValue.value)
  ) {
    justCreatedNewMatcher.value = true
    showNewMatcherInput.value = false

    emit('update:modelValue', [...validMatchers, newMatcherValue.value])

    newMatcherValue.value = ''
  }
}

const newMatcherContainer = ref<HTMLElement>()
function handleBlur() {
  setTimeout(() => {
    if (
      !newMatcherContainer.value?.contains(document.activeElement) &&
      newMatcherValue.value.length === 0
    ) {
      showNewMatcherInput.value = false
    }
  }, 0)
}

function updateMatchers() {
  emit('update:modelValue', getNonEmptyMatchers())
}
</script>

<style lang="scss" scoped>
.pattern-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pattern-list-new {
  display: flex;
  align-items: center;
  position: relative;
}

.pattern-list-info {
  display: none;
  position: absolute;
  top: -0.25rem;
  right: 0;

  color: var(--grey);
}

.pattern-list-new:focus-within .pattern-list-info {
  display: block;
}
</style>
