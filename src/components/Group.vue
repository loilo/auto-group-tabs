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
        <PatternList
          ref="patternListRef"
          @update:model-value="
            data => {
              localMatchers.splice(data.length)

              data.forEach((value, index) => {
                localMatchers[index] = value
              })

              emit('update:matchers', localMatchers)
            }
          "
          :model-value="localMatchers"
        />
      </div>
    </SlideVertical>
  </div>
</template>

<script setup lang="ts">
import GroupHeader from './GroupHeader.vue'
import SlideVertical from './Util/SlideVertical.vue'

import { useSyncedCopy } from '@/composables'
import { SaveOptions } from '@/util/types'
import { nextTick, ref } from 'vue'
import PatternList from './PatternList.vue'

const props = defineProps<{
  groupId?: string
  title: string
  color: chrome.tabGroups.Color
  options: SaveOptions
  matchers: string[]
  sortMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:title', title: string): void
  (e: 'update:color', color: `${chrome.tabGroups.Color}`): void
  (e: 'update:options', options: SaveOptions): void
  (e: 'update:matchers', matchers: string[]): void
  (e: 'delete'): void
  (e: 'after-enter'): void
}>()

defineExpose({
  showNewMatcher
})

// Create a copy of the matchers prop for easier local mutability
const localMatchers = useSyncedCopy(() => props.matchers)
const patternListRef = ref<InstanceType<typeof PatternList>>()

function showNewMatcher() {
  nextTick(() => {
    patternListRef.value?.showNewMatcher()
  })
}
</script>

<style lang="scss">
.group:not(.sort-hint ~ .group):not(:first-child):last-child {
  min-height: calc(100vh - 60px - 1.25rem - var(--body-padding));
}

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
  margin-bottom: 1rem;
}

.invalid-matcher {
  padding: 4px 16px;
  color: var(--mdc-theme-error, #b00020);
}
</style>
