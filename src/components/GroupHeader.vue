<template>
  <div class="group-header" :class="[color]">
    <GroupTag :color="color" :title="title" />
    <v-icon
      v-if="hasConflictingTitle"
      class="conflict-hint"
      :title="msg.duplicateGroupError"
      icon="mdi-alert"
    />

    <div class="edit-buttons" v-if="editable && !sortMode">
      <v-tooltip :text="msg.editGroupTooltip">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            class="action-button action-edit"
            variant="text"
            color="neutral"
            icon="mdi-pencil"
            @click="edit"
          />
        </template>
      </v-tooltip>

      <v-tooltip :text="msg.newMatcherTooltip">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            class="action-button action-new-matcher"
            variant="text"
            color="neutral"
            icon="mdi-link-plus"
            @click="emit('new-matcher')"
          />
        </template>
      </v-tooltip>
    </div>
    <v-icon
      v-if="sortMode"
      class="drag-handle"
      icon="mdi-drag"
      size="x-large"
    />
  </div>

  <EditDialog
    v-model="showEditDialog"
    :id="groupId"
    :title="title"
    :color="color"
    :options="options"
    @save="save"
    @delete="remove"
    deletable
  />
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
  color: chrome.tabGroups.Color
  options: SaveOptions
  editable?: boolean
  sortMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:title', title: string): void
  (e: 'update:color', color: `${chrome.tabGroups.Color}`): void
  (e: 'update:options', options: SaveOptions): void
  (e: 'delete'): void
  (e: 'new-matcher'): void
}>()

const msg = inject<Translation>('msg')!

const hasConflictingTitle = computed(() =>
  conflictManager.hasMarker(props.title),
)

const showEditDialog = ref(false)

function edit() {
  showEditDialog.value = true
}

function save(
  title: string,
  color: `${chrome.tabGroups.Color}`,
  options: SaveOptions,
) {
  emit('update:title', title)
  emit('update:color', color)
  emit('update:options', options)
}

function remove() {
  emit('delete')
}
</script>

<style scoped>
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
    color: rgb(var(--v-theme-warning));
  }

  .edit-buttons {
    margin-left: 0.4rem;
    margin-right: auto;
    z-index: 1;
    color: var(--foreground);
  }

  .action-button {
    :deep(.v-icon) {
      font-size: 1.125rem;
    }
  }

  .drag-handle {
    cursor: move;
    padding: 20px 12px;
  }
}

.group-title {
  margin: 0.5rem 0 1rem;
}

.delete-button {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 1;
}
</style>
