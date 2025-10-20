<script setup lang="ts">
import EditDialog from './components/Dialog/EditDialog.vue'
import SettingsDialog from './components/Dialog/SettingsDialog.vue'
import Group from './components/Group.vue'
import Snackbar from './components/Snackbar.vue'
import SlideVertical from './components/Util/SlideVertical.vue'
import Layout from './Layout.vue'

import { until, useDebounceFn, useStyleTag } from '@vueuse/core'
import { inject, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'
import Draggable from 'vuedraggable'

import {
  useGroupConfigurations,
  useStorage,
  useSyncedCopy,
} from '@/composables'
import { useViewStore } from '@/stores'
import { saveGroupConfigurations } from '@/util/group-configurations'
import { GroupConfiguration, SaveOptions, Translation } from '@/util/types'

const msg = inject<Translation>('msg')!
const settingsButton = useTemplateRef('settingsButton')
const addButton = useTemplateRef('addButton')
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

  showDeletedSnackbar.value = false
}

const showAddDialog = ref(false)
const showSettingsDialog = ref(false)

const sortMode = ref(false)
function toggleSortMode() {
  sortMode.value = !sortMode.value

  if (sortMode.value) {
    // Prevent options dialog height from collapsing
    document.documentElement.style.setProperty(
      '--body-height',
      `${Math.min(document.body.clientHeight, window.innerHeight)}px`,
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
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
    block: 'start',
  })
}
Object.assign(window, { scrollGroupIntoView })

function deleteGroup(group: GroupConfiguration) {
  const index = groupsCopy.value.findIndex(
    searchedGroup => searchedGroup.id === group.id,
  )

  undoStack.push(() => {
    groupsCopy.value.splice(index, 0, group)

    // oxlint-disable-next-line @typescript-eslint/no-floating-promises
    nextTick(() => {
      scrollGroupIntoView(group.id)
    })
  })
  groupsCopy.value.splice(index, 1)

  showDeletedSnackbar.value = true
}

function addGroup(
  title: string,
  color: `${chrome.tabGroups.Color}`,
  { strict, merge }: SaveOptions,
) {
  const id = crypto.randomUUID()

  groupsCopy.value.push({
    id,
    title: title,
    color: color,
    matchers: [],
    options: {
      strict,
      merge,
    },
  })

  // oxlint-disable-next-line @typescript-eslint/no-floating-promises
  nextTick(() => {
    groupRefs[id].showNewMatcher()

    setTimeout(() => {
      scrollGroupIntoView(id)
    }, 0)
  })
}

const scrollToGroup = useStorage('scrollToGroup', '', {
  storage: 'local',
})

const viewStore = useViewStore()

const showDeletedSnackbar = ref(false)

const { load } = useStyleTag(`html {
  height: 100%;
}`)

onMounted(() => {
  load()

  until(scrollToGroup.loaded)
    .toBeTruthy()
    .then(() => {
      if (scrollToGroup.data.value) {
        const id = scrollToGroup.data.value
        scrollToGroup.data.value = ''

        setTimeout(() => {
          scrollGroupIntoView(id)
        }, 300)
      }

      watch(scrollToGroup.data, id => {
        if (!id) return

        scrollToGroup.data.value = ''
        if (viewStore.edit.hasAny) {
          viewStore.edit.sendCloseSignal()

          setTimeout(() => {
            scrollGroupIntoView(id)
          }, 450)
        } else {
          scrollGroupIntoView(id)
        }
      })
    })
})
</script>

<template>
  <Layout>
    <v-container>
      <div class="settings">
        <div class="groups">
          <img
            v-if="groupsCopy.length === 0"
            src="/arrow.svg"
            class="initial-arrow"
            draggable="false"
          />
          <template v-else>
            <Draggable
              v-model="groupsCopy"
              item-key="id"
              handle=".drag-handle"
              drag-class="dragging"
              @start="startDragging"
              @end="dragging = false"
            >
              <template #header>
                <SlideVertical :duration="0.3">
                  <div class="sort-hint" v-if="sortMode">
                    {{ msg.sortHint }}
                  </div>
                </SlideVertical>
              </template>
              <template #item="{ element: group }">
                <Group
                  :ref="
                    (component: any) => {
                      if (component === null) {
                        delete groupRefs[group.id]
                      } else {
                        groupRefs[group.id] = component
                      }
                    }
                  "
                  :id="`group-${group.id}`"
                  :group-id="group.id"
                  v-model:title="group.title"
                  v-model:color="group.color"
                  v-model:options="group.options"
                  v-model:matchers="group.matchers"
                  @delete="deleteGroup(group)"
                  @after-enter="resetBodyHeight"
                  :sort-mode="sortMode"
                />
              </template>
            </Draggable>
          </template>
        </div>
        <div class="bottom-buttons">
          <v-tooltip
            v-if="groups.data.value.length > 1"
            :text="msg.buttonSortMode"
          >
            <template #activator="{ props: tooltipProps }">
              <v-fab
                v-bind="tooltipProps"
                class="sort-button"
                :color="sortMode ? 'pale-primary' : 'pale'"
                icon="mdi-swap-vertical"
                size="small"
                @click="toggleSortMode"
                mini
                :text="msg.buttonSortMode"
              />
            </template>
          </v-tooltip>

          <v-tooltip :text="msg.buttonSettings">
            <template #activator="{ props: tooltipProps }">
              <v-fab
                v-bind="tooltipProps"
                class="settings-button"
                ref="settingsButton"
                color="pale"
                icon="mdi-cog"
                size="small"
                :text="msg.buttonSettings"
                @click="showSettingsDialog = true"
              />
            </template>
          </v-tooltip>
          <SettingsDialog v-model="showSettingsDialog" />

          <v-tooltip :text="msg.buttonAddGroup">
            <template #activator="{ props: tooltipProps }">
              <v-fab
                v-bind="tooltipProps"
                class="add-button"
                ref="addButton"
                icon="mdi-plus"
                size="small"
                :text="msg.buttonAddGroup"
                @click="showAddDialog = true"
              />
            </template>
          </v-tooltip>
          <EditDialog v-model="showAddDialog" color="grey" @save="addGroup" />
        </div>

        <Snackbar v-model="showDeletedSnackbar">
          {{ msg.groupDeletedNotice }}

          <template #actions>
            <v-btn @click="undo">
              {{ msg.undo }}
            </v-btn>
          </template>
        </Snackbar>
      </div>
    </v-container>
  </Layout>
</template>

<style>
:root {
  --v-theme-overlay-multiplier: 2;
}

:where(*),
:where(*)::before,
:where(*)::after {
  box-sizing: border-box;
}

:where(
    button,
    input:not(
        :is([type='checkbox'], [type='radio'], [type='range'], [type='hidden'])
      ),
    select,
    textarea
  ) {
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 0;
  display: inline-flex;
  align-items: center;
  font: inherit;
  line-height: 1;
  letter-spacing: inherit;
  word-spacing: inherit;
  white-space: nowrap;
  background: none;
  color: inherit;
  text-align: left;
}

:where(button, input:is([type='submit'], [type='button'])) {
  cursor: pointer;
}

.v-field.v-field--variant-outlined {
  &:is(.v-input--focused *) {
    .v-label.v-field-label {
      font-weight: 500;
    }
  }

  .v-field__outline {
    --v-field-border-width: 2px;

    @media (min-resolution: 2dppx) {
      --v-field-border-width: 1.5px;
    }
  }

  &:not(.v-input--focused *) .v-field__outline {
    --v-field-border-width: 0px;
  }

  .v-field__overlay {
    background-color: rgb(var(--v-theme-text-field-background));
  }
}

.v-selection-control.v-radio .v-icon {
  --v-medium-emphasis-opacity: 1;
}

.v-btn {
  text-transform: none;
  letter-spacing: 0;

  &.v-btn--size-default.v-btn--variant-text {
    padding-inline: 8px;
  }

  &.v-btn--icon {
    font-size: 1.2em;
  }
}
</style>

<style scoped>
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

  :deep(a) {
    color: inherit;
  }
}

.bottom-buttons {
  display: flex;
  gap: 12px;
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

.sort-hint {
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--dimmed);
}
</style>
