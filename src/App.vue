<template>
  <div class="settings">
    <div class="groups">
      <img v-if="groupsCopy.length === 0" src="/arrow.svg" class="initial-arrow" draggable="false" />

      <template v-else>
        <Draggable v-model="groupsCopy" item-key="id" handle=".drag-handle" drag-class="dragging" @start="startDragging"
          @end="dragging = false">
          <template #header>
            <SlideVertical :duration="0.3">
              <div class="sort-hint" v-if="sortMode">
                {{ msg.sortHint }}
              </div>
            </SlideVertical>
          </template>
          <template #item="{ element: group }">
            <Group :ref="(component: any) => {
              if (component === null) {
                delete groupRefs[group.id]
              } else {
                groupRefs[group.id] = component
              }
            }" :id="`group-${group.id}`" :group-id="group.id" v-model:title="group.title" v-model:color="group.color"
              v-model:matchers="group.matchers" @delete="deleteGroup(group)" @after-enter="resetBodyHeight"
              :sort-mode="sortMode" />
          </template>
        </Draggable>
      </template>
    </div>

    <div class="bottom-buttons">
      <mwc-fab v-if="groups.data.value.length > 1" class="secondary-button sort-button" :class="{ toggled: sortMode }"
        icon="import_export" @click="toggleSortMode" mini :title="msg.buttonSortMode" />
      <mwc-fab ref="addJSON" icon="code" @click="openAddJSON" mini :title="msg.buttonAddJSON" />

      <mwc-fab ref="addButton" icon="add" @click="openAddDialog" mini :title="msg.buttonAddGroup" />

    </div>

    <transition name="from-right">
      <EditDialog v-if="showAddDialog" color="grey" @save="addGroup" @close="closeAddDialog" />
    </transition>

    <transition name="from-left">
      <JSONImporter v-if="showAddJSON" color="grey" @save="addJSONFunction" @close="closeAddJSON" />
    </transition>

    <mwc-snackbar :labelText="msg.groupDeletedNotice" ref="snackbar">
      <mwc-button slot="action" @click="undo">{{ msg.undo }}</mwc-button>
      <mwc-icon-button icon="close" slot="dismiss" />
    </mwc-snackbar>
  </div>
</template>

<script setup lang="ts">
import Group from './components/Group.vue'
import EditDialog from './components/Dialog/EditDialog.vue'
import SlideVertical from './components/Util/SlideVertical.vue'

import { inject, nextTick, ref } from 'vue'
import Draggable from 'vuedraggable'
import { useDebounceFn } from '@vueuse/core'

import { useSyncedCopy, useGroupConfigurations } from '@/composables'
import { saveGroupConfigurations, saveGroupJSONConfigurations } from '@/util/group-configurations'
import { GroupConfiguration, Translation } from '@/util/types'
import JSONImporter from './components/Dialog/JSONImporter.vue'

const msg = inject<Translation>('msg')!
const snackbar = ref()
const addButton = ref()
const groupRefs: Record<string, typeof Group> = {}

const groups = useGroupConfigurations()

const groupsCopy = useSyncedCopy(groups.data, () => {
  // Sync back to storage
  saveGroupConfigurations(groupsCopy.value)
})

const undoStack: Array<() => void> = []
function undo() {
  if (undoStack.length > 0) {
    const undoAction = undoStack.pop()
    undoAction!()
  }
}

const showAddDialog = ref(false)
const showAddJSON = ref(false)

function openAddDialog() {
  showAddDialog.value = true
}
function closeAddDialog() {
  showAddDialog.value = false
  addButton.value.focus()
}

function openAddJSON() {
  showAddJSON.value = true
}
function closeAddJSON() {
  showAddJSON.value = false
}

const sortMode = ref(false)
function toggleSortMode() {
  sortMode.value = !sortMode.value

  if (sortMode.value) {
    // Prevent options dialog height from collapsing
    document.documentElement.style.setProperty(
      '--body-height',
      `${Math.min(document.body.clientHeight, window.innerHeight)}px`
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

const dragging = ref(false)
function startDragging(event: any) {
  event.item.classList.add('no-matchers')
  dragging.value = true
}

const resetBodyHeight = useDebounceFn(() => {
  document.documentElement.style.removeProperty('--body-height')
}, 100)

function scrollGroupIntoView(id: string) {
  document.getElementById(`group-${id}`)?.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  })
}

function deleteGroup(group: GroupConfiguration) {
  const index = groupsCopy.value.findIndex(
    searchedGroup => searchedGroup.id === group.id
  )

  undoStack.push(() => {
    groupsCopy.value.splice(index, 0, group)

    nextTick(() => {
      scrollGroupIntoView(group.id)
    })
  })
  groupsCopy.value.splice(index, 1)

  snackbar.value.show()
}

function addGroup(title: string, color: chrome.tabGroups.ColorEnum) {
  const id = crypto.randomUUID()

  groupsCopy.value.push({
    id,
    title: title,
    color: color,
    matchers: []
  })

  nextTick(() => {
    groupRefs[id].showNewMatcher()

    setTimeout(() => {
      scrollGroupIntoView(id)
    }, 0)
  })
}

function addJSONFunction(editJSON: string) {
  console.log("This is hitting", editJSON)
  let resp = saveGroupJSONConfigurations(editJSON)
  console.log(resp)
}


// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md
</script>

<style lang="scss">
:root {
  --body-padding: 15px;

  --black: #202124;
  --white: #ffffff;

  --grey: #5f6367;
  --light-grey: #f8f9fa;
  --dark-grey: #292a2d;

  --blue-grey: #9aa0a6;

  --mdc-theme-primary: #1a73e8;
  --mdc-theme-secondary: var(--mdc-theme-primary);
  --mdc-snackbar-action-color: var(--mdc-theme-primary);
  --mdc-theme-on-primary: var(--white);
  --mdc-theme-on-secondary: var(--mdc-theme-on-primary);
  --mdc-typography-button-text-transform: none;
  --mdc-typography-button-letter-spacing: 0;
  --mdc-text-field-idle-line-color: transparent;
  --mdc-text-field-hover-line-color: transparent;
  --mdc-switch-handle-surface-color: var(--mdc-theme-primary);
  --mdc-switch-selected-hover-handle-color: var(--mdc-theme-primary);
  --mdc-switch-selected-pressed-handle-color: var(--mdc-theme-primary);
  --mdc-switch-selected-focus-handle-color: var(--mdc-theme-primary);
  --mdc-switch-selected-handle-color: var(--mdc-theme-primary);
  --mdc-switch-selected-track-color: var(--dimmed-primary);
  --mdc-switch-selected-hover-track-color: var(--dimmed-primary);
  --mdc-switch-selected-pressed-track-color: var(--dimmed-primary);
  --mdc-switch-selected-focus-track-color: var(--dimmed-primary);

  --mdc-theme-warning: var(--group-yellow);

  --dimmed-background: var(--light-grey);
  --background: var(--white);
  --foreground: var(--black);
  --dimmed-foreground: var(--grey);
  --dimmed-primary: #a6c7f3;
  --super-dimmed-primary: #dfe7f1;

  --dimmed: var(--grey);

  --group-foreground: var(--white);
  --group-grey: #5f6368;
  --group-blue: #3e73e8;
  --group-red: #d93024;
  --group-yellow: #f3ab03;
  --group-yellow-foreground: var(--black);
  --group-green: #2e8038;
  --group-pink: #d01c84;
  --group-purple: #a042f4;
  --group-cyan: #327c83;
  --group-orange: #f1903e;
  --group-orange-foreground: var(--black);

  --separator: rgb(0 0 0 / 6%);

  @media (prefers-color-scheme: dark) {
    --background: var(--dark-grey);
    --dimmed-background: var(--black);
    --foreground: #e8eaed;
    --dimmed-foreground: var(--blue-grey);
    --dimmed-primary: #7c99be;
    --super-dimmed-primary: #38557a;

    --dimmed: #9fa4a9;

    --group-foreground: var(--black);
    --group-grey: #dadce0;
    --group-blue: #8ab3f8;
    --group-red: #f18b82;
    --group-yellow: #f7d563;
    --group-green: #81c895;
    --group-pink: #f38bcb;
    --group-purple: #c48af8;
    --group-cyan: #78d9ec;
    --group-orange: #f4ac70;

    --separator: rgb(255 255 255 / 10%);

    --mdc-theme-surface: #292a2d;
    --mdc-theme-on-surface: var(--white);
    --mdc-theme-text-primary-on-background: var(--white);

    --mdc-theme-primary: #8ab4f8;
    --mdc-theme-on-primary: var(--black);
    --mdc-theme-error: #f18b82;

    --mdc-text-field-fill-color: rgb(0 0 0 / 30%);
    --mdc-text-field-ink-color: var(--foreground);
    --mdc-text-field-label-ink-color: var(--group-grey);

    --mdc-checkbox-unchecked-color: var(--blue-grey);
    --mdc-checkbox-ink-color: var(--mdc-theme-on-primary, #fff);

    --mdc-radio-unchecked-color: var(--blue-grey);

    --mdc-switch-unselected-icon-color: var(--white);
  }
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  box-sizing: border-box;
  height: var(--body-height, auto);
  min-height: 350px;
  margin: 0;
  padding: var(--body-padding);

  background-color: var(--background);
  color: var(--foreground);
  font-family: Roboto, system-ui, sans-serif;
  font-size: 14px;

  @supports (overflow-y: overlay) {
    overflow-y: overlay;

    &::-webkit-scrollbar {
      width: 16px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--blue-grey);
      border-radius: 10px;
      border: 6px solid transparent;
      box-sizing: content-box;
      background-clip: padding-box;
      transition: border-width 400ms;
    }

    &::-webkit-scrollbar-thumb:hover {
      border-width: 5px;
    }

    &::-webkit-scrollbar-track-piece {
      background: 0 0;
    }
  }
}

h2 {
  -webkit-font-smoothing: antialiased;
  font-family: inherit;
  font-size: 1.25rem;
  line-height: 2rem;
  font-weight: 500;
  letter-spacing: 0.0125em;
  text-decoration: inherit;
  text-transform: inherit;
}

mwc-textfield {
  height: 40px;
  border-radius: var(--mdc-shape-small, 4px);
  overflow: hidden;
}

mwc-select {
  height: 40px;
  border-radius: var(--mdc-shape-small, 4px);
}

mwc-switch {
  --mdc-theme-surface: var(--white);
}

mwc-fab {
  z-index: 1;
}

hr {
  padding: 0;
  margin: 2rem 0 1.5rem;
  height: 0;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

[fullwidth] {
  width: 100%;
}

.from-right-leave-active,
.from-right-enter-active {
  transition: transform 450ms, opacity 300ms;
}

.from-right-leave-to,
.from-right-enter-from {
  opacity: 0;
  transform: translateX(30%);
}

.from-right-leave-from,
.from-right-enter-to {
  opacity: 1;
  transform: translateX(0%);
}
</style>

<style lang="scss" scoped>
.settings {
  padding-bottom: 60px;
}

.groups {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.group-matchers-info {
  margin-top: 0.5rem;
  color: var(--grey);
  font-size: 12px;

  ::v-deep(a) {
    color: inherit;
  }
}

.bottom-buttons {
  display: flex;
  gap: 4px;
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 1;
}

.initial-arrow {
  position: fixed;
  right: 60px;
  bottom: 67px;
  width: 80px;
  height: auto;
}

.secondary-button {
  --mdc-fab-box-shadow: 0 3px 5px -1px rgb(0 0 0 / 12%),
    0 6px 10px 0 rgb(0 0 0 / 6%), 0 1px 18px 0 rgb(0 0 0 / 4%);
  --mdc-theme-on-secondary: var(--dimmed);
  --mdc-theme-secondary: var(--white);

  @media (prefers-color-scheme: dark) {
    --mdc-theme-secondary: var(--black);
  }

  &.toggled {
    --mdc-theme-secondary: var(--super-dimmed-primary);
    --mdc-theme-on-secondary: var(--mdc-theme-primary);
  }
}

.sort-hint {
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--dimmed);
}
</style>
