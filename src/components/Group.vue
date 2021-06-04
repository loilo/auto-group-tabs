<template>
  <div class="group">
    <GroupHeader
      editable
      :title="title"
      :color="color"
      @update:title="value => $emit('update:title', value)"
      @update:color="value => $emit('update:color', value)"
      @delete="$emit('delete')"
    />

    <div class="group-matchers">
      <Textfield
        v-for="matcher in localMatchers"
        :key="matcher.id"
        :modelValue="matcher.value"
        @update:modelValue="
          value => {
            matcher.value = value
          }
        "
        :pattern="matcherPattern"
        :placeholder="msg.urlInputPlaceholder"
        @blur="updateMatchers"
        :error-message="msg.invalidUrlPattern"
      />
      <div class="group-matchers-new">
        <Textfield
          ref="newMatcher"
          v-model="newMatcherValue"
          :pattern="matcherPattern"
          :placeholder="msg.urlInputPlaceholder"
          @blur="handleNewMatcher"
          :error-message="msg.invalidUrlPattern"
        />

        <!--
          The production build partly eradicates the info icon when used as a
          regular component, therefore we inject it as innerHTML.
        -->
        <a
          tabindex="-1"
          class="group-matchers-info"
          href="https://developer.chrome.com/docs/extensions/mv2/match_patterns/"
          target="_blank"
          rel="noopener"
          :title="msg.matchPatternInfo"
          v-html="`<mwc-icon-button icon='info_outline'></mwc-icon-button>`"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmit, defineProps, watch } from 'vue'
import { generateId, matcherPattern } from '../shared/util'

const matcherPatternRegex = new RegExp(`^${matcherPattern}$`)

const props = defineProps({
  title: String,
  color: String,
  matchers: Array
})

const emit = defineEmit([
  'update:title',
  'update:color',
  'update:matchers',
  'delete'
])

// Create a copy of the matchers prop for easier local mutability
const localMatchers = ref(
  props.matchers.map(matcher => ({ id: generateId(), value: matcher }))
)

// Update local matchers when prop changes
watch(
  () => props.matchers,
  value => {
    localMatchers.value = value.map(matcher => ({ value: matcher }))
  }
)

const newMatcherValue = ref('')
const newMatcher = ref()

const isEmpty = value => value.trim().length === 0
const isEmptyMatcher = matcher => isEmpty(matcher.value)
const not = fn => (...args) => !fn(...args)

function getNonEmptyMatchers() {
  let matchers = localMatchers.value

  if (matchers.some(isEmptyMatcher)) {
    matchers = matchers.filter(not(isEmptyMatcher))
  }

  return matchers.map(({ value }) => value)
}

function handleNewMatcher() {
  let validMatchers = getNonEmptyMatchers()

  if (
    !isEmpty(newMatcherValue.value) &&
    newMatcher.value.isValid() &&
    !validMatchers.includes(newMatcherValue.value)
  ) {
    emit('update:matchers', [...validMatchers, newMatcherValue.value])
  } else {
    emit('update:matchers', validMatchers)
  }

  if (newMatcher.value.isValid()) {
    newMatcherValue.value = ''
  }
}

function updateMatchers() {
  emit('update:matchers', getNonEmptyMatchers())
}

function showMatchPatternInfo() {
  window.open(
    'https://developer.chrome.com/docs/extensions/mv2/match_patterns/'
  )
}
</script>

<style>
.group-matchers {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
