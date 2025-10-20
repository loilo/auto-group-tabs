<script lang="ts" setup>
import GroupTag from '@/components/GroupTag.vue'
import Select from '@/components/Form/Select.vue'

import { onMounted, watch, computed } from 'vue'
import { until } from '@vueuse/core'
import {
  useChromeState,
  useGroupConfigurations,
  useSyncedCopy,
} from '@/composables'
import {
  createGroupConfigurationMatcher,
  saveGroupConfigurations,
} from '@/util/group-configurations'
import { isExtensionWorker } from '@/util/helpers'

const props = defineProps<{
  modelValue: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'new'): void
}>()

const groups = useGroupConfigurations()

const groupColors = computed(() =>
  Object.fromEntries(groups.data.value.map(group => [group.id, group.color])),
)

const [currentTab] = isExtensionWorker
  ? await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    })
  : []

const chromeState = useChromeState()

await until(groups.loaded).toBeTruthy()
await until(() => chromeState.tabGroups.loaded.value).toBeTruthy()

const tabGroup = computed(() =>
  currentTab && currentTab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE
    ? chromeState.tabGroups.items.value.find(
        tabGroup => tabGroup.id === currentTab!.groupId,
      )
    : undefined,
)

const tabGroupPredicate = computed(() =>
  tabGroup.value
    ? createGroupConfigurationMatcher(tabGroup.value)
    : () => false,
)
const tabGroupConfigured = computed(() =>
  groups.data.value.find(tabGroupPredicate.value),
)

const options = useSyncedCopy(() =>
  groups.data.value.map(group => ({
    value: group.id,
    label: group.title,
  })),
)

const value = useSyncedCopy(() => props.modelValue)

onMounted(() => {
  if (tabGroupConfigured.value) {
    emit('update:modelValue', tabGroupConfigured.value.id)
  }
})

function addNew() {
  emit('new')
}

async function addFromCurrent() {
  const id = crypto.randomUUID()

  const groupsChanged = until(groups.data).changed()
  await saveGroupConfigurations([
    ...groups.data.value,
    {
      id,
      title: tabGroup.value!.title ?? '',
      color: tabGroup.value!.color,
      matchers: [],
      options: { strict: false, merge: false },
    },
  ])
  await groupsChanged

  emit('update:modelValue', id)
}

watch(value, value => {
  emit('update:modelValue', value)
})
</script>

<template>
  <Select :options="options" :label="msg.popupSelectLabel" v-model="value">
    <template #selection="{ item }">
      <GroupTag :color="groupColors[item.value]" :title="item.title" />
    </template>
    <template v-if="tabGroup && !tabGroupConfigured" #before>
      <v-list-item @click="addFromCurrent">
        <span class="create-group-item">
          <v-icon icon="mdi-plus" />

          <span class="create-group-item-label">
            {{ msg.popupAddCurrentGroup }}
          </span>
          <GroupTag :color="tabGroup!.color" :title="tabGroup!.title" />
        </span>
      </v-list-item>
    </template>

    <template #default="item">
      <GroupTag :color="groupColors[item.value]" :title="item.title" />
    </template>

    <template #after>
      <v-list-item @click="addNew">
        <span class="create-group-item">
          <v-icon icon="mdi-plus" />

          <span class="create-group-item-label">
            {{ msg.popupCreateGroup }}
          </span>
        </span>
      </v-list-item>
    </template>
  </Select>
</template>

<style scoped>
.create-group-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(var(--v-theme-primary));
}

.create-group-item-label {
  font-size: 14px;
  font-weight: 500;
  margin-top: 0.15em;
}

.add-from-current {
  margin-bottom: 6px;
}

.add-new {
  margin-top: 6px;
}
</style>
