<script lang="ts" setup>
import type { VTextField } from 'vuetify/components'
import SlideVertical from './Util/SlideVertical.vue'

import { tickResetRef, useSyncedCopy } from '@/composables'
import { inputPattern, isRegexPattern } from '@/util/helpers'
import { Translation } from '@/util/types'
import { inject, useTemplateRef } from 'vue'
import { computed, nextTick, ref } from 'vue'

const props = defineProps<{
  keepOne?: boolean
}>()

const model = defineModel<string[]>({ required: true })

const msg = inject<Translation>('msg')!
const matcherRefs = ref<
  Record<string, { component: InstanceType<typeof VTextField>; index: number }>
>({})
const sortedMatcherRefs = computed(() =>
  Object.values(matcherRefs.value)
    .sort((a, b) => a.index - b.index)
    .map(({ component }) => component),
)

const inputPatternRegex = new RegExp(inputPattern)

type Matcher = {
  id: string
  value: string
}

type Rule = (value: string) => true | string

// Create a copy of the matchers prop for easier local mutability
const localMatchers = useSyncedCopy<Matcher[]>(() => {
  const items = model.value.map(matcher => ({
    id: crypto.randomUUID(),
    value: matcher,
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
  showNewMatcher,
})

const justCreatedNewMatcher = tickResetRef(false)
const newMatcherValue = ref('')
const newMatcher = useTemplateRef('newMatcher')
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

  return matchers
}

function getNonEmptyMatcherValues() {
  return getNonEmptyMatchers().map(({ value }) => value)
}

function getValidMatchers() {
  const matchers = getNonEmptyMatchers()
  return matchers.filter(matcher => {
    const rules = getRules(matcher)
    return evaluateRules(rules, matcher.value)
  })
}

function showNewMatcher() {
  showNewMatcherInput.value = true

  // oxlint-disable-next-line @typescript-eslint/no-floating-promises
  nextTick(() => {
    newMatcher.value?.focus()
  })
}

async function returnFromMatcherInput(matcherIndex: number) {
  await delay(0)

  if (matcherIndex === -1) {
    await newMatcher.value?.validate()
    await handleNewMatcher()
    showNewMatcher()

    // oxlint-disable-next-line @typescript-eslint/no-floating-promises
    nextTick(() => {
      newMatcher.value?.focus()
    })
  } else if (matcherIndex < sortedMatcherRefs.value.length - 1) {
    sortedMatcherRefs.value[matcherIndex + 1]?.focus()
  } else if (localMatchers.value[matcherIndex].value.length > 0) {
    showNewMatcher()
  }
}

function backspaceFromMatcherInput(matcherIndex: number) {
  setTimeout(() => {
    if (matcherIndex === -1) {
      if (sortedMatcherRefs.value.length > 0) {
        sortedMatcherRefs.value[sortedMatcherRefs.value.length - 1].focus()
      } else {
        newMatcher.value?.blur()
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

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function handleNewMatcher() {
  await delay(0)

  if (
    !isEmpty(newMatcherValue.value) &&
    evaluateRules(getRules(), newMatcherValue.value)
  ) {
    justCreatedNewMatcher.value = true
    showNewMatcherInput.value = false

    const validMatchers = getNonEmptyMatcherValues()

    model.value = [...validMatchers, newMatcherValue.value]

    newMatcherValue.value = ''
  }
}

function triggerBlur(event: KeyboardEvent) {
  ;(event.target as HTMLElement).blur()
}

const newMatcherContainer = useTemplateRef('newMatcherContainer')
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

function getRules(matcher?: Matcher): Rule[] {
  const patternRule = (value: string) =>
    value.length === 0 || inputPatternRegex.test(value)
      ? true
      : isRegexPattern(value)
      ? msg.invalidRegex
      : msg.invalidUrlPattern

  const duplicateRule = (value: string) =>
    !localMatchers.value
      .filter(localMatcher => (matcher ? localMatcher.id !== matcher.id : true))
      .map(localMatcher => localMatcher.value)
      .includes(value) || msg.alreadyIncluded

  return [patternRule, duplicateRule]
}

function evaluateRules(rules: Rule[], value: string): boolean {
  for (const rule of rules) {
    const result = rule(value)
    if (result !== true) {
      return false
    }
  }
  return true
}

async function updateMatchers(matcher: Matcher) {
  await delay(0)

  const rules = getRules(matcher)
  if (!evaluateRules(rules, matcher.value)) return

  const nonEmptyMatchers = getNonEmptyMatchers()
  const validMatchers = getValidMatchers()
  if (validMatchers.length < nonEmptyMatchers.length) return

  model.value = validMatchers.map(matcher => matcher.value)
}
</script>

<template>
  <div class="pattern-list">
    <template v-for="(matcher, index) in localMatchers" :key="matcher.id">
      <div class="pattern-list-item">
        <v-text-field
          :ref="
            (component: any) => {
              if (component === null) {
                delete matcherRefs[matcher.id]
              } else {
                matcherRefs[matcher.id] = { component, index }
              }
            }
          "
          :model-value="matcher.value"
          @update:model-value="matcher.value = $event"
          :label="msg.urlInputPlaceholder"
          class="textfield"
          validate-on="blur"
          :rules="getRules(matcher)"
          @change="updateMatchers(matcher)"
          @keydown.backspace="
            matcher.value.length === 0 && backspaceFromMatcherInput(index)
          "
          @keydown.enter="returnFromMatcherInput(index)"
          @keydown.escape="triggerBlur"
        />
        <v-tooltip :text="msg.matchPatternInfo">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              href="https://developer.chrome.com/docs/extensions/mv3/match_patterns/"
              target="_blank"
              rel="noopener"
              class="pattern-list-info"
              variant="text"
              color="blue-grey"
              icon="mdi-information-outline"
            />
          </template>
        </v-tooltip>
      </div>
    </template>
    <slide-vertical :disabled="justCreatedNewMatcher" :duration="0.3">
      <div
        v-if="showNewMatcherInput"
        class="pattern-list-item pattern-list-new"
        ref="newMatcherContainer"
        @focusout="handleBlur"
      >
        <v-text-field
          ref="newMatcher"
          v-model="newMatcherValue"
          :label="msg.urlInputPlaceholder"
          class="textfield"
          validate-on="blur"
          :rules="getRules()"
          @blur="handleNewMatcher"
          @keydown.backspace="
            newMatcherValue.length === 0 && backspaceFromMatcherInput(-1)
          "
          @keydown.enter="returnFromMatcherInput(-1)"
          @keydown.escape="triggerBlur"
        />
        <v-tooltip :text="msg.matchPatternInfo">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              href="https://developer.chrome.com/docs/extensions/mv3/match_patterns/"
              target="_blank"
              rel="noopener"
              class="pattern-list-info"
              variant="text"
              color="blue-grey"
              icon="mdi-information-outline"
            />
          </template>
        </v-tooltip>
      </div>
    </slide-vertical>
  </div>
</template>

<style scoped>
.pattern-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pattern-list-item {
  display: flex;
  align-items: center;
  position: relative;
}

.pattern-list-info {
  opacity: 0;
  pointer-events: none;
  position: absolute;
  top: -0.25rem;
  right: 0;

  color: var(--grey);

  &:is(.pattern-list-item:focus-within *, :focus-visible) {
    opacity: 1;
    pointer-events: all;
  }
}

.textfield :deep(.v-field) {
  --v-field-padding-end: 48px;
}

:deep(.v-field.v-field--variant-outlined) {
  &:is(.v-input--dirty:not(.v-input--focused) *) {
    --v-medium-emphasis-opacity: 0;
  }
}
</style>
