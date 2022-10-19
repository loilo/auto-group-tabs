<template>
  <Layout>
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
                :ref="(component: any) => {
                if (component === null) {
                  delete groupRefs[group.id]
                } else {
                  groupRefs[group.id] = component
                }
              }"
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
        <mwc-fab
          v-if="groups.data.value.length > 1"
          class="secondary-button sort-button"
          :class="{ toggled: sortMode }"
          icon="import_export"
          @click="toggleSortMode"
          mini
          :title="msg.buttonSortMode"
        />

        <mwc-fab
          ref="settingsButton"
          class="secondary-button settings-button"
          icon="settings"
          @click="openSettingsDialog"
          mini
          :title="msg.buttonSettings"
        />

        <mwc-fab
          ref="addButton"
          icon="add"
          @click="openAddDialog"
          mini
          :title="msg.buttonAddGroup"
        />
      </div>

      <transition name="from-right">
        <EditDialog
          v-if="showAddDialog"
          color="grey"
          @save="addGroup"
          @close="closeAddDialog"
        />
      </transition>

      <transition name="from-right">
        <SettingsDialog
          v-if="showSettingsDialog"
          color="grey"
          @close="closeSettingsDialog"
        />
      </transition>

      <mwc-snackbar :labelText="msg.groupDeletedNotice" ref="snackbar">
        <mwc-button slot="action" @click="undo">{{ msg.undo }}</mwc-button>
        <mwc-icon-button icon="close" slot="dismiss" />
      </mwc-snackbar>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import EditDialog from './components/Dialog/EditDialog.vue'
import SettingsDialog from './components/Dialog/SettingsDialog.vue'
import Group from './components/Group.vue'
import SlideVertical from './components/Util/SlideVertical.vue'
import Layout from './Layout.vue'

import { until, useDebounceFn, useStyleTag } from '@vueuse/core'
import { inject, nextTick, onMounted, ref, watch } from 'vue'
import Draggable from 'vuedraggable'

import {
  useGroupConfigurations,
  useStorage,
  useSyncedCopy
} from '@/composables'
import { useViewStore } from '@/stores'
import { saveGroupConfigurations } from '@/util/group-configurations'
import { GroupConfiguration, SaveOptions, Translation } from '@/util/types'

const msg = inject<Translation>('msg')!
const snackbar = ref()
const settingsButton = ref()
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
function openAddDialog() {
  showAddDialog.value = true
}
function closeAddDialog() {
  showAddDialog.value = false
  addButton.value.focus()
}

const showSettingsDialog = ref(false)
function openSettingsDialog() {
  showSettingsDialog.value = true
}
function closeSettingsDialog() {
  showSettingsDialog.value = false
  settingsButton.value.focus()
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
    block: 'start'
  })
}
Object.assign(window, { scrollGroupIntoView })

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

function addGroup(
  title: string,
  color: chrome.tabGroups.ColorEnum,
  { strict, merge }: SaveOptions
) {
  const id = crypto.randomUUID()

  groupsCopy.value.push({
    id,
    title: title,
    color: color,
    matchers: [],
    options: {
      strict,
      merge
    }
  })

  nextTick(() => {
    groupRefs[id].showNewMatcher()

    setTimeout(() => {
      scrollGroupIntoView(id)
    }, 0)
  })
}

const scrollToGroup = useStorage('scrollToGroup', '', {
  storage: 'local'
})

const viewStore = useViewStore()

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
