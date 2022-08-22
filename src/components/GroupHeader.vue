<template>
  <div class="group-header" :class="[color]">
    <GroupTag :color="color" :title="title" />
    <mwc-icon
      v-if="hasConflictingTitle"
      class="conflict-hint"
      :title="msg.duplicateGroupError"
    >
      warning
    </mwc-icon>

    <div class="edit" v-if="editable && !sortMode">
      <mwc-icon-button
        class="action-button"
        icon="edit"
        :title="msg.editGroupTooltip"
        @click="edit"
      />
      <mwc-icon-button
        class="action-button"
        icon="add_link"
        :title="msg.newMatcherTooltip"
        @click="emit('new-matcher')"
      />
    </div>
    <mwc-icon v-if="sortMode" class="drag-handle">drag_indicator</mwc-icon>
  </div>

  <transition name="from-right">
    <EditDialog
      v-if="showEditDialog"
      :id="groupId"
      :title="title"
      :color="color"
      :options="options"
      @save="save"
      @delete="remove"
      @close="showEditDialog = false"
      deletable
    />
  </transition>
</template>

<script setup lang="ts">
import EditDialog from './Dialog/EditDialog.vue'
import { SaveOptions } from '@/util/types'

import { computed, inject, ref } from 'vue'

import { Translation } from '@/util/types'
import * as conflictManager from '@/util/conflict-manager'
import GroupTag from './GroupTag.vue'

const props = defineProps<{
  groupId?: string
  title: string
  color: chrome.tabGroups.ColorEnum
  options: SaveOptions
  editable?: boolean
  sortMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:title', title: string): void
  (e: 'update:color', color: chrome.tabGroups.ColorEnum): void
  (e: 'update:options', options: SaveOptions): void
  (e: 'delete'): void
  (e: 'new-matcher'): void
}>()

const msg = inject<Translation>('msg')!

const hasConflictingTitle = computed(() =>
  conflictManager.hasMarker(props.title)
)

const showEditDialog = ref(false)

function edit() {
  showEditDialog.value = true
}

function save(
  title: string,
  color: chrome.tabGroups.ColorEnum,
  options: SaveOptions
) {
  emit('update:title', title)
  emit('update:color', color)
  emit('update:options', options)
}

function remove() {
  emit('delete')
}
</script>

<style lang="scss" scoped>
.group-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  font-size: 14px;
  font-weight: 400;
  cursor: default;

  &.grey {
    --group-color: var(--group-grey);
    --group-foreground-color: var(--group-grey-foreground);
  }
  &.blue {
    --group-color: var(--group-blue);
    --group-foreground-color: var(--group-blue-foreground);
  }
  &.red {
    --group-color: var(--group-red);
    --group-foreground-color: var(--group-red-foreground);
  }
  &.yellow {
    --group-color: var(--group-yellow);
    --group-foreground-color: var(--group-yellow-foreground);
  }
  &.green {
    --group-color: var(--group-green);
    --group-foreground-color: var(--group-green-foreground);
  }
  &.pink {
    --group-color: var(--group-pink);
    --group-foreground-color: var(--group-pink-foreground);
  }
  &.purple {
    --group-color: var(--group-purple);
    --group-foreground-color: var(--group-purple-foreground);
  }
  &.cyan {
    --group-color: var(--group-cyan);
    --group-foreground-color: var(--group-cyan-foreground);
  }

  &.orange {
    --group-color: var(--group-orange);
    --group-foreground-color: var(--group-orange-foreground);
  }

  .conflict-hint {
    margin-left: 0.5rem;
    color: var(--mdc-theme-warning);
  }

  .edit {
    margin-left: 0.4rem;
    margin-right: auto;
    z-index: 1;
    color: var(--foreground);
  }

  .action-button {
    --mdc-icon-size: 18px;
  }

  .drag-handle {
    cursor: move;
    padding: 12px 6px;
  }

  .eyedropper {
    color: var(--foreground);
    background: var(--background);
    z-index: 1;
    padding-left: 0.25em;
    margin-right: -1px;
  }

  .color-button {
    --mdc-theme-primary: var(--group-color);
  }
}

mwc-dialog {
  @media (prefers-color-scheme: dark) {
    --mdc-dialog-box-shadow: 0px 11px 15px -7px rgba(0, 0, 0, 1),
      0px 24px 38px 3px rgba(0, 0, 0, 1), 0px 9px 46px 8px rgba(0, 0, 0, 1);
  }
}

.group-title {
  margin: 0.5rem 0 1rem;
}

.preview {
  width: 100vw;
  box-sizing: border-box;
  margin: -20px -24px 20px;
  padding: 8px 24px 0 !important;
  border-radius: var(--mdc-shape-medium, 4px) var(--mdc-shape-medium, 4px) 0 0;
}

.delete-button {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 1;
}
</style>
