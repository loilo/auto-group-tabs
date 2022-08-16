<template>
  <div class="group">
    <GroupHeader
      editable
      :group-id="groupId"
      :title="title"
      :color="color"
      :options="options"
      :sort-mode="sortMode"
      @update:title="emit('update:title', $event)"
      @update:color="emit('update:color', $event)"
      @update:options="emit('update:options', $event)"
      @delete="emit('delete')"
      @new-matcher="showNewMatcher"
    />

    <SlideVertical :duration="0.3" @after-enter="emit('after-enter')">
      <div v-if="!sortMode" class="group-matchers">
        <Textfield
          v-for="(matcher, index) in localMatchers"
          :key="matcher.id"
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
        <SlideVertical :disabled="justCreatedNewMatcher" :duration="0.3">
          <div
            v-if="showNewMatcherInput"
            class="group-matchers-new"
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
              class="group-matchers-info"
              href="https://developer.chrome.com/docs/extensions/mv3/match_patterns/"
              target="_blank"
              rel="noopener"
              :title="msg.matchPatternInfo"
              v-html="`<mwc-icon-button icon='info_outline'></mwc-icon-button>`"
            />
          </div>
        </SlideVertical>
      </div>
    </SlideVertical>
  </div>
</template>

<script setup lang="ts">
import Textfield from './Form/Textfield.vue'
import GroupHeader from './GroupHeader.vue'
import SlideVertical from './Util/SlideVertical.vue'

import { matcherPattern } from '@/util/helpers'
import { SaveOptions } from '@/util/types'
import { computed, nextTick, ref, toRaw, toRef, watch } from 'vue'
import { tickResetRef, useSyncedCopy } from '@/composables'

const props = defineProps<{
  groupId?: string
  title: string
  color: chrome.tabGroups.ColorEnum
  options: SaveOptions
  matchers: string[]
  sortMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:title', title: string): void
  (e: 'update:color', color: chrome.tabGroups.ColorEnum): void
  (e: 'update:options', options: SaveOptions): void
  (e: 'update:matchers', matchers: string[]): void
  (e: 'delete'): void
  (e: 'after-enter'): void
}>()

defineExpose({
  showNewMatcher
})

const matcherRefs = ref<Record<string, { component: any; index: number }>>({})
const sortedMatcherRefs = computed(() =>
  Object.values(matcherRefs.value)
    .sort((a, b) => a.index - b.index)
    .map(({ component }) => component)
)

// Create a copy of the matchers prop for easier local mutability
const localMatchers = useSyncedCopy(() =>
  props.matchers.map(matcher => ({ id: crypto.randomUUID(), value: matcher }))
)

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
      showNewMatcher()
      nextTick(() => {
        newMatcher.value.focus()
      })
    } else if (matcherIndex < sortedMatcherRefs.value.length - 1) {
      sortedMatcherRefs.value[matcherIndex + 1]?.focus()
    } else {
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
  let validMatchers = getNonEmptyMatchers()

  if (
    !isEmpty(newMatcherValue.value) &&
    newMatcher.value?.isValid() &&
    !validMatchers.includes(newMatcherValue.value)
  ) {
    justCreatedNewMatcher.value = true
    showNewMatcherInput.value = false

    emit('update:matchers', [...validMatchers, newMatcherValue.value])

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
  emit('update:matchers', getNonEmptyMatchers())
}

function showMatchPatternInfo() {
  window.open(
    'https://developer.chrome.com/docs/extensions/mv3/match_patterns/'
  )
}
</script>

<style lang="scss">
.group.dragging {
  background-color: var(--dimmed-background);
  padding: 5px 10px;
  border-radius: var(--mdc-shape-small, 4px);

  .edit,
  .group-matchers {
    display: none;
  }
}

.group-matchers {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.group-matchers-info {
  display: none;
  position: absolute;
  top: -0.25rem;
  right: 0;

  color: var(--grey);
}

.group-matchers-new {
  display: flex;
  align-items: center;
  position: relative;
}

.group-matchers-new:focus-within .group-matchers-info {
  display: block;
}

.invalid-matcher {
  padding: 4px 16px;
  color: var(--mdc-theme-error, #b00020);
}
</style>
