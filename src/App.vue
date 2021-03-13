<template>
  <div class="settings">
    <div class="groups">
      <img
        v-if="groups.length === 0"
        src="/arrow.svg"
        class="initial-arrow"
        draggable="false"
      />

      <Group
        v-for="group in sortedGroups"
        :key="group.id"
        :id="`group-${group.id}`"
        v-model:title="group.title"
        v-model:color="group.color"
        v-model:matchers="group.matchers"
        @delete="deleteGroup(group)"
      />
    </div>

    <mwc-fab
      class="button-add-group"
      icon="add"
      @click="openAddDialog"
      mini
      :title="msg.buttonAddGroup"
    />

    <transition name="from-right">
      <EditDialog
        v-if="showAddDialog"
        :title="msg.newGroupTitle"
        color="grey"
        @save="addGroup"
        @close="closeAddDialog"
      />
    </transition>

    <mwc-snackbar :labelText="msg.groupDeletedNotice" ref="snackbar">
      <mwc-button slot="action" @click="undo">{{ msg.undo }}</mwc-button>
      <mwc-icon-button icon="close" slot="dismiss" />
    </mwc-snackbar>
  </div>
</template>

<script setup>
import { computed, inject, nextTick, ref, watch } from 'vue'
import {
  generateId,
  loadGroups,
  readStorage,
  saveGroups,
  writeStorage
} from './shared/util'

const msg = inject('msg')
const snackbar = ref()

const groups = ref([])
const sortedGroups = computed(() =>
  groups.value.slice().sort((a, b) => a.title.localeCompare(b.title))
)

loadGroups().then(result => {
  groups.value = result ?? []
})

const undoStack = []
function undo() {
  if (undoStack.length > 0) {
    const undoAction = undoStack.pop()
    undoAction()
  }
}

const showAddDialog = ref(false)
function openAddDialog() {
  showAddDialog.value = true
}
function closeAddDialog() {
  showAddDialog.value = false
}

function scrollGroupIntoView(id) {
  document.getElementById(`group-${id}`).scrollIntoView({
    behavior: 'smooth'
  })
}

function deleteGroup(group) {
  const index = groups.value.indexOf(group)

  undoStack.push(() => {
    groups.value.splice(index, 0, group)

    nextTick(() => {
      scrollGroupIntoView(group.id)
    })
  })
  groups.value.splice(index, 1)

  snackbar.value.show()
}

function addGroup(title, color) {
  const id = generateId()

  groups.value.push({
    id,
    title: title,
    color: color,
    matchers: []
  })

  nextTick(() => {
    scrollGroupIntoView(id)
  })
}

watch(
  () => groups.value,
  value => {
    saveGroups(value)
  },
  { deep: true }
)

// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md
</script>

<style lang="scss">
:root {
  --body-padding: 15px;

  --black: #202124;
  --white: #ffffff;
  --grey: #5f6367;

  --mdc-theme-primary: #1a73e8;
  --mdc-theme-secondary: var(--mdc-theme-primary);
  --mdc-snackbar-action-color: var(--mdc-theme-primary);
  --mdc-theme-on-primary: var(--white);
  --mdc-theme-on-secondary: var(--mdc-theme-on-primary);
  --mdc-typography-button-text-transform: none;
  --mdc-typography-button-letter-spacing: 0;
  --mdc-text-field-idle-line-color: transparent;
  --mdc-text-field-hover-line-color: transparent;

  --background: var(--white);
  --foreground: var(--black);

  --dimmed: #5f6367;

  --group-foreground: var(--white);
  --group-grey: #5f6367;
  --group-blue: #1a73e8;
  --group-red: #d93025;
  --group-yellow: #e37402;
  --group-green: #208e3e;
  --group-pink: #d01784;
  --group-purple: #9333e6;
  --group-cyan: #037b83;

  @media (prefers-color-scheme: dark) {
    --background: #292a2d;
    --foreground: #e8eaed;

    --dimmed: #9fa4a9;

    --group-foreground: var(--black);
    --group-grey: #bdc1c5;
    --group-blue: #8ab4f7;
    --group-red: #f28b82;
    --group-yellow: #fdd563;
    --group-green: #81c895;
    --group-pink: #ff8ccb;
    --group-purple: #d6affb;
    --group-cyan: #78d9ec;

    --mdc-theme-surface: #292a2d;
    --mdc-theme-on-surface: var(--white);
    --mdc-theme-text-primary-on-background: var(--white);

    --mdc-theme-primary: #8ab4f8;
    --mdc-theme-on-primary: var(--black);

    --mdc-text-field-fill-color: rgb(0 0 0 / 30%);
    --mdc-text-field-ink-color: var(--foreground);
    --mdc-text-field-label-ink-color: var(--group-grey);
  }
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  box-sizing: border-box;
  min-height: 350px;
  margin: 0;
  padding: var(--body-padding);

  background-color: var(--background);
  color: var(--foreground);
  font-family: Roboto, system-ui, sans-serif;
  font-size: 81.25%;
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

.button-add-group {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
}

.initial-arrow {
  position: fixed;
  right: 70px;
  bottom: 32px;
  width: 70px;
  height: auto;
}
</style>
