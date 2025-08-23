<script lang="ts" setup>
import { computed, inject } from 'vue'
import * as conflictManager from '@/util/conflict-manager'
import { Translation } from '@/util/types'

const props = withDefaults(
  defineProps<{
    title?: string
    color: `${chrome.tabGroups.Color}`
    dense?: boolean
  }>(),
  {
    dense: false,
  },
)

const msg = inject<Translation>('msg')!

const hasConflictingTitle = computed(() =>
  conflictManager.hasMarker(props.title ?? ''),
)

const displayTitle = computed(() => {
  if (typeof props.title !== 'string') return ''
  if (!props.title) return `(${msg.noGroupTitle})`
  if (hasConflictingTitle.value)
    return conflictManager.withoutMarker(props.title)
  return props.title
})
</script>

<template>
  <span
    class="tag"
    :class="{
      'no-title': !title && displayTitle,
      dot: !displayTitle,
      dense: dense && displayTitle,
    }"
    :style="{
      '--tag-color': `var(--group-${color})`,
      '--tag-foreground-color': `var(--group-${color}-foreground)`,
    }"
  >
    <span class="tag-label" v-if="displayTitle">{{ displayTitle }}</span>
  </span>
</template>

<style lang="scss" scoped>
.tag {
  position: relative;
  display: inline-block;
  border-radius: 6px;
  padding: 0.35em 0.6em;
  font-size: var(--tag-font-size, 14px);
  font-weight: 400;
  color: var(--tag-foreground-color, var(--group-foreground));
  background-color: var(--tag-color);
  z-index: 1;
  white-space: pre;

  &.dense {
    padding: 0.2em 0.5em;
  }

  &.dot {
    width: var(--tag-dot-size, 14px);
    height: var(--tag-dot-size, 14px);
    border-radius: 50%;
    padding: 0;
  }

  .tag-label {
    // Hard-code line height in case height-modifying characters (e.g. emoji) are used
    display: block;
    height: 16px;
    line-height: 1.2;
  }

  &.no-title .tag-label {
    opacity: 0.75;
  }
}
</style>
