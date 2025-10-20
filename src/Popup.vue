<script lang="ts" setup>
import Layout from './Layout.vue'
import EditDialog from './components/Dialog/EditDialog.vue'
import PopupAdditionalActions from './components/Popup/AdditionalActions.vue'
import PopupGroupSelection from './components/Popup/GroupSelection.vue'
import PopupSuggestion from './components/Popup/Suggestion.vue'
import Snackbar from './components/Snackbar.vue'
import SlideVertical from './components/Util/SlideVertical.vue'

import { useGroupConfigurations, useStorage } from '@/composables'
import { saveGroupConfigurations } from '@/util/group-configurations'
import { isExtensionWorker, matcherPattern } from '@/util/helpers'
import { SaveOptions } from '@/util/types'
import { computed, onMounted, ref, watch } from 'vue'

const popupSuggestionRef = ref<InstanceType<typeof PopupSuggestion>>()

const groups = useGroupConfigurations()

const showAddDialog = ref(false)
function openAddDialog() {
  showAddDialog.value = true
}
function closeAddDialog() {
  showAddDialog.value = false
}
function cancelAddDialog() {
  selectedGroup.value = null
}
async function saveAddDialog(
  title: string,
  color: `${chrome.tabGroups.Color}`,
  options: SaveOptions,
) {
  const id = crypto.randomUUID()

  await saveGroupConfigurations([
    ...groups.data.value,
    {
      id,
      title,
      color,
      matchers: [],
      options,
    },
  ])

  selectedGroup.value = id
}

const selectedGroup = ref<string | null>(null)
const patterns = ref<string[]>([])

const matcherRegex = new RegExp(matcherPattern)

const hasValidMatchers = computed(() => {
  if (patterns.value.length === 0) return false
  if (!patterns.value.every(value => matcherRegex.test(value))) return false

  if (selectedGroup.value === null) return false

  return true
})

const showPopupSavedSnackbar = ref(false)

const errorMessage = ref('')

watch(hasValidMatchers, value => {
  if (value) {
    errorMessage.value = ''
  }
})

function savePatterns() {
  if (!hasValidMatchers.value) {
    errorMessage.value =
      'Please enter at least one URL pattern and select a group.'
    return
  }

  groups.data.value = groups.data.value.map(group => {
    if (group.id === selectedGroup.value) {
      return {
        ...group,
        matchers: [...new Set([...group.matchers, ...patterns.value])],
      }
    } else {
      return group
    }
  })

  selectedGroup.value = ''
  patterns.value = []

  showPopupSavedSnackbar.value = true
}

function addLink() {
  popupSuggestionRef.value?.showNewMatcher()
}

function openOptions() {
  if (isExtensionWorker) {
    chrome.runtime.openOptionsPage()
  } else {
    window.open('/?context=options')
  }

  window.close()
}

function editGroup(id: string) {
  scrollToGroup.data.value = id
  openOptions()
}

async function createFromCurrentGroup(
  title: string,
  color: chrome.tabGroups.Color,
  tabs: chrome.tabs.Tab[],
) {
  const id = crypto.randomUUID()
  scrollToGroup.data.value = id

  await saveGroupConfigurations([
    ...groups.data.value,
    {
      id,
      title,
      color,
      matchers: [],
      options: { strict: false, merge: false },
    },
  ])

  patterns.value = tabs.map(tab => tab.url!)
  selectedGroup.value = id
}

const scrollToGroup = useStorage('scrollToGroup', '' as string, {
  storage: 'local',
})

onMounted(() => {
  setTimeout(() => {
    if (document.body.scrollWidth > document.body.clientWidth) {
      document.documentElement.style.setProperty(
        '--popup-width',
        `${document.body.clientWidth - 2 * 15}px`,
      )
    }
  }, 0)
})
</script>

<template>
  <Layout>
    <Suspense>
      <v-container>
        <div class="popup">
          <h1 class="h6">{{ msg.popupHeadline }}</h1>
          <PopupSuggestion ref="popupSuggestionRef" v-model="patterns" />
          <SlideVertical :duration="0.3">
            <v-btn
              v-if="patterns.length > 0"
              class="button-add-pattern"
              prepend-icon="mdi-link-plus"
              @click="addLink"
              density="compact"
              variant="text"
            >
              {{ msg.popupAddLink }}
            </v-btn>
          </SlideVertical>
          <PopupGroupSelection
            class="popup-group-selection"
            :model-value="selectedGroup"
            @update:model-value="selectedGroup = $event"
            @new="openAddDialog"
          />
          <v-btn class="button-save" @click="savePatterns">
            {{ msg.popupSaveButton }}
          </v-btn>
          <SlideVertical :duration="0.3">
            <p
              class="error-message"
              v-if="errorMessage"
              v-text="errorMessage"
            />
          </SlideVertical>
          <hr />
          <div class="more-options">
            <v-btn prepend-icon="mdi-cog" @click="openOptions" variant="text">
              {{ msg.popupMoreOptions }}
            </v-btn>
            <PopupAdditionalActions
              v-if="isExtensionWorker"
              @create-group="createFromCurrentGroup"
              @edit-group="editGroup"
            />
          </div>
        </div>
      </v-container>
    </Suspense>

    <EditDialog
      v-model="showAddDialog"
      color="grey"
      @cancel="cancelAddDialog"
      @save="saveAddDialog"
    />

    <Snackbar v-model="showPopupSavedSnackbar">
      {{ msg.popupSavedMessage }}
    </Snackbar>
  </Layout>
</template>

<style scoped>
.popup {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: var(--popup-width, 600px);
}

.popup-group-selection {
  margin: 0.75rem 0;
}

.button-add-pattern {
  align-self: flex-start;
}

.button-save {
  align-self: flex-start;
}

.more-options {
  display: flex;
  gap: 0.5rem;
}
</style>
